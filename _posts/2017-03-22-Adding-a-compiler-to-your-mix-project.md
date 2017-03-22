---
layout: post
title:  "Adding a Elm compilation to you Mix project"
date:   2017-03-22 20:00:00
categories:
---

We've been using cowboy for some time at work for writing small REST-endpoints and lately [ Elm ](http://elm-lang.org) as been added to the mix to provide front-ends for those endpoints.

At the beginning the work flow was to compile the Elm assets, copy the result to the `priv/` in our cowboy projects and let cowboy serve them from there. That work flow feelt a bit clunky. If you made changes to both the cowboy handlers and the Elm code you would have to run both `elm make` and `mix compile`. 

To make that work flow a bit more smooth we have integrated the Elm compile cycle into `mix compile`. You can see the end result here: [elm-compile](https://hex.pm/packages/elm_compile).

If you're just looking an easy way to integrate Elm into your mix projects just stop reading now and follow the link above. If on the other hand you're interested in how to add external compilers to a mix project read on.

## Two approaches
There are two approaches to adding Elm compilation to your Mix project: Override `mix compile` with an alias or add Elm compilation to the list of compilers used by `mix compile`.

### An aside on writing your own Mix tasks
Both approaches will require us to write our own Mix tasks. Luckily thats easy.

> A Mix task can be defined by simply using Mix.Task in a module starting with Mix.Tasks. and defining the run/1 function:
> -- [Mix.Task behaviour docs](https://hexdocs.pm/mix/Mix.Task.html)

It basically boils down to createing a module in the `Mix.Task` namespace, adding `use Mix.Task` and implementing `run(args)` as required by the `Mix.Task` behaviour. You can find an example [ here ](https://github.com/ErikMejerHansen/elm_compile/blob/master/lib/mix/task/elm_compile.ex).

## Using aliases
If you've already encountered Mix aliases if you've ever created a [Phoenix](http://www.phoenixframework.org/). If you look at the `mix.exs` file in a Phoenix project you'll see the following:
{% highlight elixir %}
  def project do
    [app: .....
     version: .....
     elixir: .....
     elixirc_paths: .....
     aliases: aliases(),
     deps: deps()]
  end

  defp aliases do
    ["ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
     "ecto.reset": ["ecto.drop", "ecto.setup"],
     "test": ["ecto.create --quiet", "ecto.migrate", "test"]]
  end
{% endhighlight %}

Here they are using aliases to create convenience tasks like `ecto.setup` that creates, migrate and seeds the database. 

But you can also use aliases to _override existing_ Mix tasks. So given that we have created a Mix task in the 'Mix.Tasks.Compile.Elm' module you could create the following alias:
{% highlight elixir %}
defp aliases do
   ["compile": ["compile", "compile.elm"]]
end
{% endhighlight %}
We are in essence telling mix to first run its normal `compile` and afterwards run the Elm compile task. Mix aliases are awesome and can be really helpful in smoothing out your work flow. But overriding the compile task is perhaps not the best use of aliases.

## Adding a compiler
The other alternative is to place you task in the `Mix.Tasks.Compile.Elm` namespace and then adding it to the list of Mix compilers. 

Again: Take a look at the `mix.exs` file from a Phoenix project. Under the project definition you'll spot the following: `compilers: [:phoenix, :gettext] ++ Mix.compilers`. 

They are adding `:phoenix` and `:gettext` to the compilers run by `mix compile`. Modify that to `compilers: Mix.compilers ++ [:elm]` and you're good to go. 
