---
layout: post
title:  "REST services in Elixir with Cowboy"
date:   2016-10-16 14:00:00
categories:
---
`cowboy_rest` makes it easy to write REST.

It is inspired by [webmachine](https://github.com/webmachine/webmachine)[^webmachine],  services in Elixir. In this blog I'll give a quick example of how to create a couple of simple resources and lastly touch on a few of the downsides of using it.

[^webmachine]: I highly recommend reading the blog series by Sean Cribbs on webmachine found [here](http://seancribbs.com/) if you're unfamiliar with `webmachine`)

Where plug might be seen as a way to describe how to do a transformation of the request into the response, `cowboy_rest` lets your describe the characteristics of your resource and then let `cowboy_rest` decide on how to reply to the request.  


In short:   

> the request is handled as a state machine with many optional callbacks describing the resource and modifying the machine's behavior
>
> -- [The cowboy docs](https://ninenines.eu/docs/en/cowboy/1.0/guide/rest_handlers/)


This makes for a nicely declarative way of describing your resources as you'll hopefully see below. It provides a lot of help (or at least, opinions) in providing correct replies.

You can find the code used in this [blog here](https://github.com/ErikMejerHansen/REST-service-examples) (alongside parallel implementations in `Phoenix` and `Webmachine`).

## The first resource
Lets start by creating a new Elixir project using the `--sup` flag to get a supervisor for our project:
{% highlight bash %}
mix new cowboy_rest_example --sup
{% endhighlight %}
For the rest of this blog I'll assume you ran the command above and thus named the project `cowboy_rest_example`.

## Getting :cowboy up and running
We now need to get :cowboy up and running. Open the file containing the `start/2` Application callback: `lib/cowboy_rest_example.ex`.
Add the following:
{% highlight elixir %}
#Dispatcher ~ router
dispatch = CowboyRestExample.Dispatch.dispatch()
{:ok, _} = :cowboy.start_http(:http, 100,
                              [port: 8000],
                              [
                                env: [dispatch: dispatch]
                              ])
{% endhighlight %}

The first two arguments `:http` and `100` tells `cowboy` to listen to `http` connections (the other option being `:https`) and to start 100 [`ranch`](https://hex.pm/packages/ranch) acceptors. The choice of `100` was more or less arbitrary and I can't offer much advice as to this setting.

`env: [dispatch: dispatch]` sets the dispatcher (aka router) for our resources, we'll get to that in a moment.   
`[port: 8000]` tells cowboy to listen to port `8000`.   

## Dispatching
One of the options we supplied to `cowboy` was a dispatch table that we'll define in `CowboyRestExample.Dispatch`:

Routes in `cowboy` are defined as a list of `{host, [routes]}` tuples. Most likely you'll want to set the host to `:_` meaning match everything. But you could use the host part to match on different subdomains (see: the [routing](https://ninenines.eu/docs/en/cowboy/1.0/guide/routing/) section of the `cowboy` documentation for more information).

We'll start out with a dispatch table that looks like this:
{% highlight elixir %}
defmodule CowboyRestExample.Dispatch do
  def dispatch() do
    # Routes in cowboy are {host, [paths]} tuples
    #The :_ atom causes cowboy_router to match any host.
    :cowboy_router.compile([{:_, routes()}])
  end

  def routes() do
    [
      {"/", CowboyRestExample.Hello, []},
    ]
  end
end
{% endhighlight %}

I've moved the routes/paths out into the `routes` function. Paths are defined as a three element tuple `{path_match, handler, options}`.
So in the above example we have told `cowboy` to let `CowboyRestExample.Hello` handle any requests to `"/"` (and we've supplied no options to `CowboyRestExample.Hello`).

## The "Hello, world" handler
Time to write our first handler. Create a file for the `CowboyRestExample.Hello` module.

{% highlight elixir %}
defmodule CowboyRestExample.Hello do
  def init(_protocol, _request, _options), do: {:upgrade, :protocol, :cowboy_rest}
  def to_html(request, state), do: {"<h1>Hello, World</h1>", request, state}
end
{% endhighlight %}

The `init` method is the first callback we get from `cowboy` when handling requests to `"/"`. Here we tell `cowboy` that we want to perform a protocol upgrade to `:cowboy_rest`. In essence we're telling `cowboy` that our handler will respond to the callbacks used by `cowboy_rest`.

As stated in the introduction introduction request will be handled as a state-machine and the callbacks we respond to change the behavior alters the behaviour of that state-machine. But we don't have to respond to every call! The callbacks all have reasonable defaults.   
So for now we can get away with just implementing the `to_html` function:
{% highlight elixir %}
def to_html(request, state), do: {"<h1>Hello, World</h1>", request, state}
{% endhighlight %}

Every callback from `:cowboy_rest` will take the same form. The function will receive `request` and `state` arguments to the function and it'll respond with a tuple consisting of its reply and the request and state tuples.

If you start your project now with `mix run --no-halt` and open `localhost:8000` in a browser you should see the traditional "Hell, World" greeting.

But what if we wanted a json response?
Try `curl -I --request GET --url http://localhost:8000/ --header 'accept: application/json'` in terminal.
You'll get the following response:
{% highlight bash %}
HTTP/1.1 406 Not Acceptable
server: Cowboy
date: Sat, 15 Oct 2016 10:05:14 GMT
content-length: 0
{% endhighlight %}

So our resource does not support replying with `application/json`, lets fix that.

The `content_types_provided` callback is how we define what content-types our resource supports.
{% highlight elixir %}
def content_types_provided(request, state) do
    {[{"text/html", :to_html},
    {"application/json", :to_json}], request, state}
  end
{% endhighlight %}

Our response here (aside from request and state which we'll always have to return) is a list of tuples, each tuple containing a content-type and the name of the function that can generate the response in that content-type.
Lets add the `to_json` function:
{% highlight elixir %}
def to_json(request, state), do: {Poison.encode!(%{hello: "world"}), request, state}
{% endhighlight %}
Restart `cowboy` after making the changes (take a look at [remix](https://hex.pm/packages/remix) if you find it annoying restarting `cowboy` after each change).
Run that `curl` command again:
``curl --request GET --url http://localhost:8000/ --header 'accept: application/json'``. Note that the `-I` argument has been removed.      
Sucess! We now have our JSON response. We can now also understand why earlier it was sufficient to just implement the `to_html` function. `cowboy_rest` defaults to serving `html` by calling the `to_html` function.

What happens if you don't set an `accept` header? And what happens if you change the order of the tuples in our reply from `content_types_provided`?    
Answer: If no `accept` header is present in the request `cowboy_rest` chooses to reply with the first content-type in the content_types_provided list.


## The "Todo" handler
Lets extend the example with new resource for getting a list of todos and creating a todos.   
First the dispatcher is extended and then the resource gets defined in its own module.

### Extending the dispatcher
Add `{"/todo", CowboyRestExample.TodoResource, []}` the list of routes in `CowboyRestExample.Dispatch.routes`.

Next create the `CowboyRestExample.TodoResource` module as below:

{% highlight elixir %}
defmodule CowboyRestExample.TodoResource do
def init(_protocol, _request, options), do: {:upgrade, :protocol, :cowboy_rest}

def rest_init(request, _options), do: {:ok, request, %{}}
end
{% endhighlight %}

There is a new callback here: `rest_init`. Its the first callback the resource gets after doing a protocol upgrade to `:cowboy_rest`.
It allows us to set the initial state and return it as the last element of the response tuple, here its initialized as a empty map.

We only want to respond with `json` so add a `content_types_accepted` that makes that true:

{% highlight elixir %}
{[{"application/json", :from_json}], request, state}
{% endhighlight %}

Now we want to be able to get the list Todos. These will be fetched from a MySql database using ecto. I wont show the setup here but take a look at the github repo [here](https://github.com/ErikMejerHansen/REST-service-examples) if you want the details.

We now have a choice to make: What reply do we want if there are no todos? Empty list or a `404` status code?
Here we'll use the `404` status code because it allows me to introduce the next callback: `resource_exists`. Returning `false` from this function will yield a `404` reply. It also makes for a nice place to actually fetch the Todos from the database.

{% highlight elixir %}
def resource_exists(request, state) do

  case Repo.all(CowboyRestExample.Todo) do
    nil -> {false, request, state}
    todos -> {true, request, Map.put(state, :todos, todos)}
  end

end
{% endhighlight %}

In essence we're pulling all the todos from the database and adding it to our state map under the `:todos` key.
Now that we have a list of Todos in our state we can transform those into JSON in the `to_json` function:

{% highlight elixir %}
def to_json(request, state) do
    todos = state.todos
    |> Enum.map(&(%{
              todo: &1.subject,
              created: &1.inserted_at
              }))
    |> Poison.encode!()

    {todos, request, state}
  end
{% endhighlight %}

And with that we have our list Todo resource done.

## Posting a Todo
But a Todo example isn't worth its salt if you can't add todos.
In order to do that we need define two additional callbacks and add a function saving the new todo to the database.

If you try and send a `POST` at `/todo` right now you'll get a `405 Method not allowed` response back. To fix that add the following:

 {% highlight elixir %}
 def allowed_methods(request, state) do
      {["GET", "HEAD", "OPTIONS", "POST"], request, state}
  end
 {% endhighlight %}

We now supports `POST`. Trying another `POST` at `/todo` will result in a `415 Unsupported Media Type` response because we haven't told `:cowboy_rest` that we want to accept `application/json`.

The `content_types_accepted` callback allows us to state what content-types we accept.
{% highlight elixir %}
def content_types_accepted(request, state) do
 {[{'application/json', :from_json}], request, state}
end
{% endhighlight %}

The `:from_json` function also needs defining:
{% highlight elixir %}
def from_json(request, state) do
    {:ok, body, request} = :cowboy_req.body(request)

    todo = Poison.decode!(body)
    Repo.insert!(%CowboyRestExample.Todo{subject: todo["todo"]})

    {true, request, state}
  end
{% endhighlight %}

The first line of that function reads the body of the request. And here we stumble onto one of the quirks of `cowboy` all functions on `:cowboy_req` will return a request tuple which may or may not differ from the one passed to it. As the `:cowboy` docs state:

> Whenever Req is returned, you must use this returned value and ignore any previous you may have had. This value contains various state informations which are necessary for Cowboy to do some lazy evaluation or cache results where appropriate.
>
> -- [The cowboy docs](https://ninenines.eu/docs/en/cowboy/1.0/manual/cowboy_req/index.html)

The the second line uses [Poison](https://hex.pm/packages/poison) to decode the request body into a map.    
The third line inserts a new Todo into the database.   
And finally the fourth line tells `:cowboy_rest` that we succeeded.

If you try posting now you'll get at `204 No Content` response. Huh? I was expecting a `201 Created` response.   
Well it turns out you should set a location header in the response when sending a `201` status code.

Luckily that is easily fixed:
{% highlight elixir %}
def from_json(request, state) do
    {:ok, body, request} = :cowboy_req.body(request)

    todo = Poison.decode!(body)
    todo = Repo.insert!(%CowboyRestExample.Todo{subject: todo["todo"]})

    {host, request} = :cowboy_req.host(request)

    { {true, "#{host}/todo/#{todo.id}"}, request, state}
  end
{% endhighlight %}

We need to know the `host` and the `id` so that we can construct a link for the `location` header. Then we can extend our reply to `{true, "#{host}/todo/#{todo.id}"}`. That is: "Yes, we could understand the body you sent us and you can find the result over there".

Try posting again. What? `303 See other`? `303` is what you would send if your service prevented duplicates by pointing the client at the preexisting version of what they tried to create.    
And sure enough our `resource_exists` did return `true` indicating that the resource did already exist.

Ok, time to fix that.
{% highlight elixir %}
def resource_exists(request, state) do
  {method, request} = :cowboy_req.method(request)
  todos = Repo.all(CowboyRestExample.Todo)

  case {method, todos} do
    {"POST", _} -> {false, request, state}
    {_, nil} -> {false, request, state}
    {_, todos} -> {true, request, Map.put(state, :todos, todos)}
  end
end
{% endhighlight %}

So if the request is a `POST` or there are no Todos we'll return `false` otherwise return `true`. You might be tempted to try and use pattern matching you match different `resource_exists` implementations based on the request method. But unfortunately the request argument is a humongous tuple that does not lend itself easily to pattern matching.

Lets try that `POST` again. Bingo! A nice and shiny `201 Created` response!

## Getting a single Todo
One final resource: Getting a single Todo.   
Again extend the dispatcher add `{"/todo/:id", CowboyRestExample.TodoResource, []}` to the routes.

If you have done any projects in [`Phoenix`](http://phoenixframework.org) the `:id` syntax should seem familiar. Its tells `:cowboy` to bind any value after `/todo/` to the id `:id` so that we may fetch is in our resource.

Now create the `CowboyRestExample.SingleTodoResource` module:
{% highlight elixir %}
defmodule CowboyRestExample.SingleTodoResource do
  alias CowboyRestExample.Repo
  def init(_protocol, _request, _options), do: {:upgrade, :protocol, :cowboy_rest}

  def rest_init(request, _options), do: {:ok, request, %{}}

  def allowed_methods(request, state) do
      {["GET", "HEAD", "OPTIONS"], request, state}
  end

  def resource_exists(request, state) do
    {id, request} = :cowboy_req.binding(:id, request)
    case Repo.get(CowboyRestExample.Todo, String.to_integer(id)) do
      nil -> {false, request, state}
      todo ->
        {true, request, Map.put(state, :todo, todo)}
    end
  end

  def content_types_provided(request, state) do
    {[{"application/json", :to_json}], request, state}
  end

  def to_json(request, state) do
    todo = Poison.encode!(%{
              todo: state.todo.subject,
              created: state.todo.inserted_at
              })

    {todo, request, state}
  end

end
{% endhighlight %}

The formula should seem familiar now: Upgrade the protocol to `:cowboy_rest`, fetch the todo in `resource_exists` and transform it to JSON in `to_json`. But aren't things getting a bit repetitive and thus drawing focus away from the differences between the two Todo resources?

Lets define a module with some defaults:

{% highlight elixir %}
defmodule CowboyRestExample.Defaults do
  defmacro __using__(_) do
    quote do
      @behaviour CowboyRestExample.DefaultBehaviour

      alias CowboyRestExample.Repo

      def init(_protocol, _request, _options), do: {:upgrade, :protocol, :cowboy_rest}

      def rest_init(request, _options), do: {:ok, request, %{}}

      def content_types_provided(request, state) do
        {[{"application/json", :to_json}], request, state}
      end

      def is_authorized(request, state) do
        {auth_header, request} = :cowboy_req.header("authorization", request)
        IO.inspect auth_header
        case auth_header do
          :undefined -> { {false, "Basic"}, request, state}
          _ -> {true, request, Map.put(state, :rights, "Everything")}
        end
      end

      def forbidden(request, state), do: {true, request, state}

      defoverridable [forbidden: 2]
    end
  end
end

defmodule CowboyRestExample.DefaultBehaviour do
  @callback to_json(Tuple.t, Tuple.t) :: Tuple.t
end
{% endhighlight %}

If we now add `use CowboyRestExample.Defaults` we now skip implementing the callbacks for the functions that won't differ across resources thus drawing out the differences between our resources. We have also defined some safe defaults for the security related `is_authorized` and `forbidden` callbacks. In effect denying access to a resource unless we explicitly grant access.   
`defoverridable [forbidden: 2]` allows the different resources to override the `forbidden` callback (which would not be possible if we did not add `defoverridable`).

As a final touch we add a very simple behaviour: `CowboyRestExample.DefaultBehaviour` which just defines our own `to_json` callback. This is here to help our future selves. If we forget to implement a `to_json` function in a resource that uses `CowboyRestExample.Defaults` we'll get a nice compiler warning reminding us to do so.

You can find the final code on [github](https://github.com/ErikMejerHansen/REST-service-examples).

And that brings us to the end of the example.

## Why not just use Phoenix?
Phoenix is a valid choice for doing REST service. At [work](http://www.opentelehealth.com) we have our first two Phoenix service moving into production just about now). And we really, _really_ like Phoenix. But experience of building our first two services has given us the chance to evaluate if Phoenix is right for us.  

### Is the plug model right for us?
They way we handle requests seems like an ill fit for the `plug` model.
We have to do authentication, authorization and JSON schema validation of every request received to our APIs.   
Authorization is the same across resources so thats not the problem, but authentication differs across resource and method (for instance one user might have access creating a give resource but not altering it). So we end up with constructs like this:
{% highlight elixir %}
plug :authorize, [permissions: ["Read: Sessions"]] when action in [:list, :show, :list_by_team]
 plug :authorize, [permissions: ["Create: Sessions"]] when action in [:create]
 plug :authorize, [permissions: ["Update: Sessions"]] when action in [:update]
 plug :authorize, [permissions: ["Delete: Sessions"]] when action in [:delete]
{% endhighlight %}

We have much the same situation with performing JSON schema validations.

### We don't use templates, channels nor i18n
We're building APIs (that we then build web apps on top of) and as a consequence we're not using templates, channels nor i18n. So there's a lot of Phoenix we're not using.

## Batteries not included
`cowboy_rest` is not without its drawbacks among which are:   
- No logging: By default `cowboy` performs no logging, so you'll have to figure out your own   
- Erlang stacktraces: You'll have to learn to read Erlang stacktraces. Which takes some getting used to.   
- Way less creature comforts: Phoenix does a lot to help the developer along. Automatic recompilation, _great_ getting started guides, and excellently helpful error messages. Cowboy has none of that.  

## Performance?
Performance has not been a factor for looking beyond Phoenix. Phoenix is plenty fast.   
But below you'll find a graph comparing Posting a Todo, getting a single Todo, getting a list of 10 todos and getting the "Hello, World" resource across `cowboy`, `Webmachine` and `Phoenix`.   
Test were conducted using [`wrk`](https://github.com/wg/wrk) running with 300 connections.   
Wrk, MySql and phoenix/cowboy/webmachine are all running on the same machine (a Mid 2015 MacBook Pro).   
Don't read to much into the results - in real life most likely everything _but_ phoenix/cowboy/webmachine is going to dominate the response times.

![Requests per second: Cowboy, Webmachine, Phoenix](/assets/req_per_sec.png)
