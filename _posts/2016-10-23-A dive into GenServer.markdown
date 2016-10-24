---
layout: post
title:  "Unexpected message"
date:   2016-10-24 20:00:00
categories: Elixir, TIL
---
Do you know on which process the `start_link` function of a `GenServer` in Elixir is run?   
`GenServer` is one of the central building blocks often turned to when building something in Elixir but the above question is not something I had ever really given any thought.

I knew that you had to be mindful of which process is doing the work when working with [agents]({% post_url 2016-02-18-Why-workers %}) but had somehow missed that the same might be the case with `GenServers`.

# Background
I've been playing around with [nerves](http://nerves-project.org), a Raspberry Pi and an Arduino board. One the things I was trying to do was to read messages sent from the Arduino to the Pi over USB.   
The [`nerves_uart`](https://hex.pm/packages/nerves_uart) makes it simple to read lines from USB and to receive those lines as as messages. So the plan was to setup a `GenServer` to start `nerves_uart` and to receive the messages from it.

# Unexpected messages
The first attempt at the code to start `nerves_uart` and receive the messages looked a bit like this:
{% highlight elixir %}
defmodule HelloNerves.Messages do
  use GenServer
  require Logger

  def start_link do
    # Start the Nerves.UART GenServer
    {:ok, _} = Nerves.UART.start_link

    # We want to listen to the USB plugged in at "ttyACM0"
    # and use newlines as a separator for the data.
    Nerves.UART.open(pid, "ttyACM0", speed: 9600, active: true,
      framing: {Nerves.UART.Framing.Line, separator: "\r\n"})

    GenServer.start_link(__MODULE__, :ok, [])
  end

  def handle_info({:nerves_uart, _serial_port_name, data}, state) do
    Logger.debug "Got info: #{data}"
    {:noreply, state}
  end
end
{% endhighlight %}

The `HelloNerves.Messages` is then started with as a worker with  `worker(HelloNerves.Messages, [])`.

Compile, upload to the Raspberry PI, sit back and watch the data flow.

# Unintended recipient
Well, not quite as it turns out. Because instead of the loging of the data I expected I started seeing the following error message instead:   
`Supervisor received unexpected message {:nerves_uart, "ttyACM0", "400"}`


Let's dig into the `nerves_uart` source and see if we can find the source of our troubles.
The source for the `Nerves.UART GenServer` can be found here: [Github](https://github.com/nerves-project/nerves_uart/blob/8a867e7e29d1739075f2d03cea2095fcb9e65132/lib/nerves_uart.ex).

If we look at the function that handles the [`open` call](https://github.com/nerves-project/nerves_uart/blob/8a867e7e29d1739075f2d03cea2095fcb9e65132/lib/nerves_uart.ex#L295) that the `pid` of the calling function gets stored in the state as `controlling_process`. And messages are sent to the `controlling_process`, but why do these messages end up at the `Supervisor`?

## The call sequence
`HelloNerves.Messages` is started with the `worker()` statement causing  `HelloNerves.Messages.start_link` to be called which then in turn calls `Nerves.UART.start_link`.   

In overview something like this:
{% highlight bash %}
HelloNerves.ex -> HelloNerves.Messages.start_link -> Nerves.UART.start_link
{% endhighlight %}

So `Nerves.UART.start_link` was in fact called from the `Supervisor` process. Which in then makes it the recipient of messages from `Nerves.UART`.

## The solution

Digging trough first the Elixir and then the Erlang the `GenServer` documentation revealed the following in the description of `init/1` function:

> this function is called by the new process to initialize
>
> -- [STDLIB Reference Manual](http://erlang.org/doc/man/gen_server.html#Module:init-1)

The point here being that while the `HelloNerves.Messages.start_link` function is run on the Supervisors process the `init/1` function is called on the newly spawned process for the `HelloNerves.Messages` GenServer.

So if I want to `Nerves.UART.start_link` from process of the `HelloNerves.Messages GenServer` it has to be done from the `init/1` callback.

This leads to the following rewrite:
{% highlight elixir %}
defmodule HelloNerves.Messages do
  use GenServer
  require Logger

  def init(port) do
    {:ok, pid} = Nerves.UART.start_link
    Nerves.UART.open(pid, port, speed: 9600, active: true, framing: {Nerves.UART.Framing.Line, separator: "\r\n"})

    {:ok, %{nerves_pid: pid}}
  end

  def start_link do
    IO.inspect(Nerves.UART.enumerate)

    GenServer.start_link(__MODULE__, "ttyACM0", [])
  end

  def handle_info({:nerves_uart, _serial_port_name, data}, state) do
    Logger.debug "Got info: #{data}"
    {:noreply, state}
  end
end
{% endhighlight %}


# Conclusion

In hindsight it seems obvious that `start_link` would be run on the callers process. But it took me a fair while to figure out that it was `init/1` I was looking for.   
Coming from a mainly OOP background I think that there is a lot of hidden complexity lurking here not stemming from anything but lack of experience.  
