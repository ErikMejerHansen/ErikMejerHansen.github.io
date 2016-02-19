---
layout: post
title:  "Elixir, Phoenix and workers, part 2: Why use workers"
date:   2016-02-18 14:00:00
categories:
---
Before I start diving into different worker/job-scheduler libraries it might be wise to take a look at why
I think workers are needed.

*Just to recap: Clients send JSON to the server. That JSON has to be transformed into XML and sent to a third party system (while maintaining the correct order of the messages).*

But why not just do the work directly in the controller or in an agent?
First and foremost we need to ensure that the message order is preserved. The consequence is that we can't send a reply to the client before we're done processing the message. Otherwise we run the risk of messages overtaking each other.

But how much of an impact does it have on performance if we were to do the work in the controller or an agent?
I tried adding between 100 and 0 milliseconds of delay to the controller and the agent.
Without any delay in the controller the server is able to handle around 450,000 requests/min dropping down to just over 50,000 requests/min for 100 ms of extra delay. That isn't too surprising.

Ok - but handing the work of to an Agent would do the trick right? It can keep state across all the requests and ensure messages are handled in order and because we're handing it off to the agent performance shouldn't suffer.

Well no performance wont *just* suffer - the server will keel over and die.

But what is happening with the agent? Even adding 1 ms of extra delay has a significant impact on the performance of the server. What is going on?
If you take a look at some of the [documentation for agents](http://elixir-lang.org/getting-started/mix-otp/agent.html) you'll run across this sentence:

> "Everything that is inside the function we passed to the agent happens in the agent process".

Agents are for keeping state - which means that messages passed to an agent are processed in order. So any delay caused by any of the requests to the server will hurt all following requests. And the consequences are clear.

![Requests per minute plotted against delays added to controller or agent](/assets/reqests-min-vs-delay.png)

So using an Agent won't work. Doing the work in the controller runs the risk of not preserving message order (the same would be true of Tasks).

So workers it is. Next time.
