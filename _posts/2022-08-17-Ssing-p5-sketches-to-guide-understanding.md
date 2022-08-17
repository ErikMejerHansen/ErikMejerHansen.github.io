---
layout: post
title: "Using visualizations to help understanding"
date: 2022-08-17 
categories:
---

I've recently started (re)reading "Principles of Product Development Flow" by Donald G. Reinertsen.
I've read it before but it did not stick.
I forgot most of what it had to say and I'm not sure I actually understood much of it the last time around.

A tactic I'm trying out to better retain what I read is to look out for opportunities to create visualizations.

For me visualizations are powerful tools to help guide understanding and I've been trying to use utilize that power as I read.

One section of "Principles of Product Development Flow" talks about random processes and uses the following as an example:
Image you flip a coin while keeping a running tally.
If you get heads you add one from your tally and if get tails you subtract one.

Reinertsen then continues:
> In general, even numerate people (such as engineers and scientists) have limited intuition for the behavior of random processes.

Sounds like a good opportunity for a visualization!

Lets draw the running tally of the coin flips as we run trough the random process.
The length of the process shown below 685.
Once a process has run trough its 685 steps we start a new process and begin drawing it on top of the old result.

<div id="fig1">
    <script type="text/javascript" src="https://erikmejerhansen.github.io/coin-flips/index.b76fa335.js" type="module"></script>
</div>

Sure enough!
That graph did not match my intuition.
My expectation was that the graph would continuously hover around the zero line.
But it doesn't!

*Boo For my intuition!
Hoorah for visualizations!*

The fun with random process does not stop there though, because Reinertsen continues:
> Although the most likely value of the cumulative sum is zero, this value becomes less likely with time.

Sounds like it's time for histograms!
My idea was to run a lot of the coin flip random processes and plot the frequency of results.

For each histogram below a random process (of the length indicated in the captions) is run for every frame, the result saved and the histogram updated.

You should see the distribution slowly settle down and it becomes visually obvious that the longer the sequence the lower the likelihood of hitting zero - even though zero is still the most likely result.
The distribution flattens out.

<div id="fig2">
    <script type="text/javascript" src="https://erikmejerhansen.github.io/coin-flips/index.2cbf189c.js" type="module"></script>
</div>

#### Why I Think This Helps

 Creating a visualization offers me an opportunity to work trough the text and understand it well enough to turn it into a visualization.
 I can't code visualizations for what I don't understand.

 And, I'm hoping, that will help me better retain what I read.
