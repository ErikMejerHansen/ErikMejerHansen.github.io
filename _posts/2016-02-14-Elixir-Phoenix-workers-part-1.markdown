---
layout: post
title:  "Elixir, Phoenix and workers, part 1: The setup"
date:   2016-02-14 16:38:00
categories:
---

This is the first post in a series looking at Elixir, Phoenix and a few different worker/job-scheduler libraries for a very specific use-case.

The use-case is not made out of whole cloth but a lot of details have been abstracted way.
The use-case is as follows: A bunch of clients send JSON messages to a web server. The messages a converted into XML and forwarded to a third party system (over which we have no control).  
There is one rule we absolutely cannot break: The order of the messages is important. One message from a given client cannot overtake another and skipping messages is also not allowed.

The idea of this blog series is to first build something to act as the third party system and a simple Phoenix based web server to receive JSON messages from the clients.
The next parts of the series will then look at different worker/job-scheduler libraries and see if they can be made to work for this specific use-case.

Before we start looking at the parts we'll need before looking at the first worker there is one point I'd like to stress: *Im just starting out with Elixir and Phoenix*.
So this is going to be a learning experience for me and you should take everything with a grain of salt[^1].
[^1]: But if you spot something stupid please let me know.

The necessary parts
------------------
This time I'll focus on the bits need before we can start testing out different workers.
The bits are:

* A web server for receiving messages from the clients
* Something to act as the third party system
* Something to act as a bunch of clients


### The web server (Phoenix)
I'll be using [Phoenix](http://www.phoenixframework.org/) for building the simple web services used by the clients.
The server will receive JSON messages that looks like this:

```json
{
  "client": "Some client",
  "data": {
    "sequenceNumber": 0,
    "sample": [1,2,3,4]
    }
  }
```

There will be a simple controller for receiving these messages and handing them off to a appropriate worker.
If the client remembers to set its `content-type` header to `application/json` the JSON will be parsed and be made available to the relevant controller method in its `params` that it receives as its second argument.

Now it makes good sense to map the received JSON into Elixir structs as a way to sanitize received data. In this case the structs looks like this:
```elixir
defmodule ExternalSystemMock.Message do
  alias ExternalSystemMock.MessageData, as: MessageData
  defstruct client: "", data: %MessageData{}
end

defmodule ExternalSystemMock.MessageData do
  defstruct sequenceNumber: 0, data: []
end
```

The newly constructed struct is then sent to workers that will handle forwarding the message to the Agent acting as the third party system.

One thing I ran into was mapping from JSON to these structs proved harder than expected. Elixir has the [Kernel.struct!/2](http://elixir-lang.org/docs/stable/elixir/Kernel.html#struct!/2) function that can take a map and map it into a specified struct. But there is one caveat that is not immediately apparent from the docs: `struct!/2` only maps from keys that are atoms.

Phoenix uses [Poison](https://github.com/devinus/poison) for parsing JSON into maps and Poison does have an option us create maps where the keys are atoms. So why doesn't Phoenix utilize that option? [Turns out theres a very good reason for that](https://engineering.appcues.com/2016/02/02/too-many-dicts.html): Atoms in Elixir are not garbage collected. So if Poison was setup to provide maps with keys that were atoms it would open up the server a denial of service attack aiming to exhaust memory.  


### The third party system (An Agent)

The primary characteristic of the third party system is that *it does not like it* when the messages it receives from any given client are out of order.
In order to emulate this behavior we need something that keep state across several requests.
The Elixir docs state that "Agents are a simple abstraction around state.". So an Agent would seem to fit the bill perfectly.

Agent is seeded with an empty map as its initial state and usage of the Agent is wrapped in module hiding away the details.
The full code for the modules is:
```elixir
defmodule ExternalSystemMock do
  alias ExternalSystemMock.Message, as: Message
  alias ExternalSystemMock.MessageData, as: MessageData

  def start do
    Agent.start fn -> Map.new() end
  end

  def receive_message(agent, %Message{client: client, data: %MessageData{sequenceNumber: sequenceNumber, data: _}}) do
    updater = &update(sequenceNumber, client, &1)

    Agent.update(agent, updater)
  end

  defp update(newSequenceNumber, client, state) do
    try do
      %{^client => [seq | _]} = state
    rescue
      MatchError -> IO.puts "match error"
    end

    case state do
      %{^client => [lastSeenSequenceNumber | _]} when lastSeenSequenceNumber + 1 == newSequenceNumber ->
        Map.update!(state, client, fn list -> [newSequenceNumber | list] end)

      %{^client => [lastSeenSequenceNumber | _]} when lastSeenSequenceNumber < newSequenceNumber ->
        raise "Missed message"

      %{^client => [lastSeenSequenceNumber | _]} when lastSeenSequenceNumber > newSequenceNumber ->
        raise "Skipped message"

      %{^client => [lastSeenSequenceNumber | _]} when lastSeenSequenceNumber == newSequenceNumber ->
        raise "Message repeat"

      %{} -> #new client
        Map.put(state, client, [newSequenceNumber])
    end
  end
end
```

The real meat is in the `update/3` function. Guard expressions ensure that if any sequence is repeated, skipped or received out of order the Agent raises an exception. Raising an unhanded exception from a Agent will cause it to die.
This is important because it will make it much easier do detect if any of the worker libraries we look at later on make any changes to the order of the messages.


### The clients (wrk)
We need something to act as a bunch of clients. I had intended to use [Gatling](http://gatling.io) which I've used before with some success. But Gatling gave out before the server did and reported response times what seemed way to high.

So I turned to [wrk](https://github.com/wg/wrk) instead (and seemed up to the job).
The small Lua script below sets up a small test. Each client will send fifty messages with increasing sequence numbers and then sends final halt messages (and then the message repeats).

```lua

local counter = 1
local threads = {}

function setup(thread)
   thread:set("threadCounter", counter)
   table.insert(threads, thread)
   counter = counter + 1
end

local requests = 0
function request()
    requests = requests + 1

    local requestHeaders = {}
    requestHeaders["Content-Type"] = "application/json"

    local r = {}
    local clientName = threadCounter .. "-" .. requests
    for i = 0, 50 do
      r[i] = wrk.format("POST", "/api/data", requestHeaders, "{\"client\":\"" ..  clientName .. "\",\"data\": {\"sequenceNumber\":" .. i .. ", \"data\": [1,2,3,4]}}")
    end

    r[50] = wrk.format("POST", "/api/data", requestHeaders, "{\"halt\": true, \"client\":\"" ..  clientName .. "\"")

    return table.concat(r)
end

```

Just as a side node: Before adding any workers and running both wrk and Phoenix on the same machine Phoenix seems to top out at around 440000 requests per minute.
I'll use this as the baseline going forward.


### Next time

Next time I'll take a look at the first worker library and give an explanation as to why a worker is necessary at all.
