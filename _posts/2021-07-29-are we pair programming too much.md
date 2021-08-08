---
layout: post
title: "Are we pair programming too much?"
date: 2020-08-05 20:00:00
categories:
---

TODO: Intro seems disconnected between first and second paragraph
The team I'm part of had been working towards making pair programming the default mode of work, when one of team members asked: "Are we pair programming too much?". That question took me by complete surprise.

"It's at least twice as fast as when everyone works on their own" is something I've heard, it's something I've said and it's something I've always just sort of taken for solid fact.

But it is though? Turns out the that it's nowhere as simple as that.
In a review of 18 studies[^1] the conclusion was (emphasis mine):

> Our meta-analysis suggest that pair programming is not uniformly **beneficial or effective**

The review of pair programing looked at the effectiveness of pair programming on:

- Duration: The calendar time it takes to complete a task
- Effort: The combined effort used to complete a a task
- Quality: The quality of the work, by looking at passed tests, grades and other metrics

The results of the review can be summarized as: Pair programming gives you a a small improvement on quality, a medium improvement in duration but you pay for that with by a medium negative effect of effort.

The negative effect on effort means that we less back from pair programming than if we just let individuals work on their own.

Part of the reason for that may be social loafing.
TODO: Needs more of a segway

## Social Loafing

> Loaf: to avoid activity, especially work

Social loafing is the phenomenon that people tend to exert less effort when working collaborative than they would have if they had worked on the same task alone.

The classical example is that of pulling on a rope to lift a weight - you might expect two people to be able to pull twice as hard and three people to lift three times as hard.

That turns out not to be the case: **You get less combined effort than you'd expect from simple addition of what the individuals are capable on their own.**

//TODO: Sentence seems unconencted.
It's worth noting that this is separate from any coordination loss you might expect.
This section leans heavily on "Social Loafing: A Meta-Analytic Review and Theoretical Integration"[^2]

// TODO: More segway!

### Size of the Effect

// TODO: more intro

I'm going to tread very carefully here because I'm by no means a statistician, but the review[^2] found an effect size expressed in terms of [Cohen's D](https://www.statisticshowto.com/cohens-d/) of 0.44.

Cohen's D puts a value on how big an effect is - more specifically how big of a difference there is between the mean values of two groups. In this case groups working alone and working together. A value of 1 means that the groups differ by 1 standard deviation.

This does not immediately make 0.44 more intuitively understandable but an effect size 0.44 falls between a "small" and a "medium" size as per the rule of thumb interpretation of effect sizes suggested by Cohen. Medium being "probably big enough to be noticed by the naked eye".
The review[^2] labels it as "within the middle range of effects in the domain of social behavior".

I'll go out on a limb and summarize that to mean: **The effect is there and it is large enough for us to care about.**

### But I don't loaf!

About now you might have the same objections that I had: “I definitely don't loaf!”.
Well I’m sorry to say but you probably do - it’s just that you may not be aware of it. In experiments where participants were asked to self report on their effort they had a tendency to report a similar level of effort as when working alone.

So we’re either unaware or unwilling to admit that we loaf.

### But Programming is Different!

The effect is also been proven to be robust across a range of activities from the simple physical task of pulling on a robe, to shouting, brainstorming, maze solving, evaluation of information, typing and pushing buttons.

I think we would be misleading ourselves if we think programming to be except from the effects of social loafing.

### What Affects Social Loafing?

So social loafing is a thing and most if not all of us do it. Now what?

Social loafing does not occur at an equal strength for all tasks and nor under all circumstances, but seems to be affected by a number of factors.

// TODO: Ok, tie in. But needs hook in the intro.
This is where the connection to the headline comes in: Can knowledge of these factors help us in deciding when to pair program. I think they can or at least some of them can be helpful in guiding us when we build teams and when we design(?) our engineering culture.

I’ll skip the discussion of factors related to gender and ethnicity (women tend loaf less as does people from eastern cultures) as well as factors that I think are detrimental to building great teams and cultures (ex. We loaf less when we think out coworkers will do a bad job). Instead I’ll focus on the factors I believe gel well with build great teams.
Go check out the [article](https://www.researchgate.net/publication/209410290_Social_Loafing_A_Meta-Analytic_Review_and_Theoretical_Integration) if your curious to know all the factors.

#### Task Valance

We loaf less when we feel we’re working on tasks that are intrinsically important.
This shouldn’t be much of a surprise. We work harder on stuff we believe is important.
What may come as a surprise is that it is likely that we are sensitive to how others feel and talk about a task.

Take away: Don’t talk down the importance of tasks. Not only are you likely to bring some you own performance but you’ll very likely bring down the performance of those working with you.
While the reverse effect also exists (that is you can talk a task up and get increased performance) I’d be hesitant to use it. Instead I’d save pair programming to talks that are actually interesting and important.

#### Task complexity

The complexity of the task at hand plays a role on social loafing. We loaf more on simple tasks than on complex tasks.
On complex tasks the effect of social loafing may even be reversed and individuals put more effort into collaborative working than they would working on their own.

#### Uniqueness of Individual Input

While unsurprising it is still worth keeping in mind, especially when doing novice-expert pairs where the novice might feel that their input is partially redundant.

Stressing that learning and gaining familiarity with the code-base (and not just task solving) is the focus in novice-expert pairs might help keep the motivation up in that specific context.

#### Team Cohesiveness and Identity

Team cohesiveness and and feeling of identity plays a strong role in social loafing.
This is probably the best news of this article: Strong teams may be able to more or less completely eliminate the effect of social loafing.

#### Group Size

Social loafing increases with group size. The bigger the group the larger the effect. This is an especially important factor to keep in mind when doing mob programming.

**Take away:** Mob sessions are at a higher risk of social loafing, so reserve them for situations where the other factors work in your favor.

<!--
#### Evaluation potential

See the section on why social loafing occurs for theories of why this may be the case. -->

### Why Does Social Loafing Occur?

The social loafing review suggest a model for explaining why social loafing occurs. It it based on the expectancy-value model that suggests tha motivation depends on:

- Expectancy: To which degree do we think high expenditure of effort leads to high performance
- Instrumentality: How closely do we believe that high performance is linked with a outcome
- Valance of outcome: How desireable is that outcome

<!-- ## The Case for Pair Programming

The review of pair programming effectiveness only looked at duration, effort and quality. These are the effects that are easy to quantify and measure. You mostly just need a stop watch to do so. Other effects that would be harder to measure but are often touted are team building, staff risk reduction and learning.

### Team building

A group of individuals working on their own (albeit on the same thing) hardly makes them a team. When done well pair programming can help build a feeling of being a team and increase the sense of working towards the same goal.

Pair programming takes practice and the listening, communication and patience needed does not come naturally to everyone. And you need to be aware of this and help you team members develop the skill necessary for good pair programming. If you don't you won't the the lift to team cohesion you could hope for - and may in fact get the opposite effect.

The good news is that one of the benefits of a cohesive team is that it helps to reduce and even eliminate the effect of social loafing.

### Risk Reduction

Knowledge silos have a tendency to just develop unless you're careful. Folks may gravitate to certain tasks and you risk ending up in a situation where you have a team where everyone keeps to "their own" part of the code. This puts you at risk when people leave you team or transition into new roles because the rest of the team will be unfamiliar with parts of the code.

Pair programming can reduce this risk by simply have more people working on the each part of the code base. And when someone leaves other team members will have already worked with

### Learning

### Beware the Stable Pairs

If you want to reap the benefits of pair programming on team building, risk reduction, learning it is my believe that you need to beware of stable pairs developing.
Stable paris is when you see the same to individuals team up again and again. -->

### Key Takeaways

- Social loafing scales with group size: Be especially mindful of the effect when doing mob programming
- Strong team cohesiveness is the strongest factor affecting social loafing
- Focus on the complex tasks: Quality improves with pair programming on complex tasks and complexity affects social loafing

## Conclusion

I strongly believe that pair programming is worth the investment, but I also believe that we should be honest about it being an investment.

We invest effort and get back knowledge sharing that help reduce the risk of knowledge silos.

We invest effort and (when it works well) we help build a more cohesive team.

We invest effort and increase learning.

But a silver bullet it is not and it comes with its own set of constraints. Knowing the factors that affect social loafing can help you get more out of the pair programming you do.

[^1]: [The effectiveness of pair programming: A meta-analysis](https://www.researchgate.net/publication/222408325_The_effectiveness_of_pair_programming_A_meta-analysis)
[^2]: [Social Loafing: A Meta-Analytic Review and Theoretical Integration](https://www.researchgate.net/publication/209410290_Social_Loafing_A_Meta-Analytic_Review_and_Theoretical_Integration)
[^3]: [The Costs and Benefits of Pair Programming](https://www.researchgate.net/publication/2333697_The_Costs_and_Benefits_of_Pair_Programming)
