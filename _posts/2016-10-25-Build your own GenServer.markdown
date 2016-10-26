---
layout: post
title:  "Building your own GenServer"
date:   2016-10-24 20:00:00
categories:
---
Sometimes it's a good learning experience to try and reimplement some of the functionality that a standard library provides.
So how much does it take to reimplement the simple parts of a GenServer?

# The simple parts
A GenServer provides you with a lot of functionality out of the box:

> The goal of a GenServer is to abstract the “receive” loop for developers, automatically handling system messages, support code change, synchronous calls and more   
> -- [The GenServer docs](http://elixir-lang.org/docs/stable/elixir/GenServer.html)

Let's focus on implementing the "receive" loop, synchronous calls and making sure that it fits in Supervision tree.

We're going to more or less implement the `Stack` example from the GenServer [docs](http://elixir-lang.org/docs/stable/elixir/GenServer.html) but without using a GenServer.

# Creating the project and the first Stack module
We need a project to get us started and we're going to need a supervisor. So `mix new stack --sup` is is.

Start out simple by defining the interface we want. We'll need `push` and `pop` functions to be a stack. And if we want to start the stack as `worker` child of the appliction Supervisor we'll also need a `start_link` function.

{% highlight elixir %}
defmodule SimpleStack do
  def push(item) do
  end

  def pop() do
  end

  def start_link() do
  end
end
{% endhighlight %}

# The `start_link` function

We're not going for anything like a full re-implementation of `GenServer` so let's try and keep our `start_link` as simple as possible.
Reading over the [`start_link/3` docs](http://elixir-lang.org/docs/v1.0/elixir/GenServer.html#start_link/3) and looking at the possible return values we see that we´re supposed to return a `{:ok, pid}` tuple with the pid of the server.

Start out by adding `SimpleStack` to the Supervisor in `Stack`

{% highlight elixir %}
  children = [
      # Starts a worker by calling: Stack.Worker.start_link(arg1, arg2, arg3)
      # worker(Stack.Worker, [arg1, arg2, arg3]),
      worker(SimpleStack, [])
    ]
{% endhighlight %}

Running the application now (`mix run`) will result in a error:
{% highlight bash %}
** (Mix) Could not start application stack: Stack.start(:normal, []) returned an error: shutdown: failed to start child: SimpleStack
** (EXIT) nil
{% endhighlight %}

So let's start working on that `start_link` function. Should be simple enough: We just need to start a new process with `spawn_link` and return it's pid.

{% highlight elixir %}
defmodule SimpleStack do
  require Logger

  def start_link() do
    pid = spawn_link(fn () -> Logger.debug "Started" end)
    {:ok, pid}
  end

  def push(item) do end
  def pop() do end
end
{% endhighlight %}

Let's try running that again: `mix run --no-halt`

{% highlight bash %}
21:14:16.783 [debug] Started

21:14:16.783 [debug] Started

21:14:16.783 [debug] Started

21:14:16.783 [debug] Started
{% endhighlight %}

Well, that didn't work. But what is going on? Try adding `max_restarts: 10` to the options sent to the supervisor like so:

{% highlight elixir %}
# See http://elixir-lang.org/docs/stable/elixir/Supervisor.html
# for other strategies and supported options
opts = [strategy: :one_for_one, name: Stack.Supervisor, max_restarts: 10]
Supervisor.start_link(children, opts)
{% endhighlight %}

Then run the application again. Now we get our `[debug] Started` ten times. So the supervisor keeps calling `start_link`.

Time to fire up `iex` and do some digging:

{% highlight bash %}
Erlang/OTP 19 [erts-8.1] [source] [64-bit] [smp:8:8] [async-threads:10] [hipe] [kernel-poll:false] [dtrace]

Interactive Elixir (1.3.1) - press Ctrl+C to exit (type h() ENTER for help)
iex(1)> pid = spawn_link(fn () -> IO.puts "Started" end)
Started
#PID<0.82.0>
iex(2)> Process.alive? pid
false
iex(3)>
{% endhighlight %}

Ah! Out process stops as soon as its done its work. The supervisor sees this and then restarts the process and keeps doing it until it reaches its `max_restarts` limit.

# The receive loop
Processes communicate via messages and each process has its own mailbox. We can use the `receive do end` statement to wait for messages to arrive at our mailbox. First let's start out by listening for a `:pop` message that we'll use to support the pop functionality of our stack.   

I've changed the `spaw_link` statement so that we can move the receive loop into its own function:

{% highlight elixir %}
def start_link() do
    pid = spawn_link(__MODULE__, :receiver, [[]])

    {:ok, pid}
  end

  def push(item) do
    #Add something here...
  end

  def pop() do end


  def receiver(state) do
    state = receive do
      {:push, element} ->
        [element | state]
      _ ->
        Logger.warn("Unexpected messaged received")
        state
    end
    receiver(state)
  end
{% endhighlight %}

The `receiver` function implements the receive loop. It gets initialized with an empty list.
The `receive` statement lets us patterne match on incomming messages.
We handle a `{:push, element}` message by adding the new element to the front of the list and after doing so we call the `receiver` recursively to wait for the next message.

# Pushing  
Next up is implementing the `push/1` function in the `SimpleStack` module.
We know that we need to send a `{:push, element}` message to the process we created in `start_link`. But how do we find the `pid` of that process again?

You know how you can register a `GenServer` with a name by calling something like this: `GenServer.start_link(Stack, [:hello], name: MyStack)`.

Turns out that giving a process a name is a pretty useful feature, and a feature that is provided by [`Process.register/2`](http://elixir-lang.org/docs/v1.2/elixir/Process.html#register/2).

Great, well extend the `start_link` function to use that.
{% highlight elixir %}
def start_link() do
  pid = spawn_link(__MODULE__, :receiver, [[]])
  Process.register(pid, :stack)
  {:ok, pid}
end

def push(element) do
  send(:stack, {:push, element})
  :ok
end
{% endhighlight %}

And now the `push/1` function can easily send a message to the process with: `send(:stack, {:push, element})`.

And so we have a simple form of `GenServer.cast`.

# Returning a response
The last thing we need to be able handle synchronous calls.
Again we do this by sending messages. We'll define a new message: `{:pop, pid}`.
So besides telling that we want to perform a pop on the stack we'll also send along the PID of the process to send the result to.

{% highlight elixir %}
def pop() do
  # Send the pop message with the PID of the current process.
  send(:stack, {:pop, self()})

  # And wait for the response
  receive do
    {:ok, element} ->
      element
    _ ->
      Logger.warn("Unexpected messaged received")
      :error
  end
end


def receiver(state) do
  state = receive do
    {:push, element} ->
      [element | state]
    {:pop, caller} ->

      [element | tail] = state
      send(caller, {:ok, element})

      tail
    _ ->
      Logger.warn("Unexpected messaged received")
      state
  end
  receiver(state)
end
{% endhighlight %}

The calling function `pop/0` starts by sending the `:pop` message. It finds its own `PID` by calling [`self()`](http://elixir-lang.org/docs/v1.2/elixir/Kernel.html#self/1).
Then it waits for the response message with `receive`.

The `:pop` message is handled we take the first element, send it to the calling process and then recursively call the `receiver/1` function with the popped stack.

And there we have the synchronous call we wanted. You can find the [completed code here](https://github.com/ErikMejerHansen/SimpleStack) if you want to play around with it.
