---
layout: post
title: "Are we pair programming too much?"
date: 2021-08-08 21:00:00
categories:
---

The team I'm part of had been working towards making pair programming the default mode of work, when one of the team members asked: "Are we pair programming too much?".

_"It's at least twice as fast as when everyone works on their own"_ is something I've heard, it's something I've said and it's something I've always just sort of taken for solid fact. We couldn't be doing too much pair programming if it's the most efficient way of working.

But it is though? The answer may be that it's nowhere as simple as that. In a review of 18 studies[^1] the conclusion was:

> Our meta-analysis suggest that pair programming is not uniformly **beneficial or effective**

The review of pair programing looked at the effectiveness of pair programming on:

- **Duration**: The calendar time it takes to complete a task

- **Effort**: The joint effort used to complete a task

- **Quality**: The quality of the work, by looking at passed tests, grades and other metrics

The results of the review can be summarized as: Pair programming gives you a a small improvement on quality and a medium improvement in duration, but you pay for those with a medium negative effect of effort.

The negative effect on effort means that we less back from pair programming than if we just let everyone work on their own.

Seems like if we take the research at its word then perhaps, we are indeed pair programming too much? But what's going on and is there something we can do to improve the situation? Or at least supply some guidance on when pair programming is likely to be the most effective?

Part of the reason for the results and a potential source of guidance may be found in the phenomenon of social loafing.

## Social Loafing

> Loaf: to avoid activity, especially work

Social loafing is the phenomenon that people tend to exert less effort when working collaboratively than they would have if they had worked on the same task alone.

The classical example is that of pulling on a rope to lift a weight - you might expect two people to be able to pull twice as hard and three people to lift three times as hard.

That turns out not to be the case: **You get less joint effort than you'd expect from simple addition of what the individuals are capable on their own.**

It's worth noting that this is separate from any coordination loss you might expect.

### Size of the Effect

How big of an effect is social loafing? "Social Loafing: A Meta-Analytic Review and Theoretical Integration"[^2] on which I'm leaning heavily on terms it as:

> within the middle range of effects in the domain of social behavior

More formally the review found an effect size of 0.44 expressed in terms of [Cohen's D](https://www.statisticshowto.com/cohens-d/).

I'm going to tread very carefully here because I'm by no means a statistician, but Cohen's D puts a value on how big an effect is - more specifically how big of a difference there is between the mean values of two groups. In this case the two groups are the group working alone and the group working together. A Cohen's D value of 1 means that the groups differ by 1 standard deviation.

This does not at once make 0.44 more intuitively understandable but an effect size 0.44 falls between a "small" and a "medium" size as per the rule of thumb interpretation of effect sizes suggested by Cohen. Medium being "probably big enough to be noticed by the naked eye".

I'll go out on a limb and summarize that to mean: **The effect is there, and it is large enough for us to care about.**

### But I don't loaf!

About now you might have the same objection that I had: “I definitely don't loaf!”.

Well, I’m sorry to say but you probably do - it’s just that you may not be aware of it. In experiments where participants were asked to self-report on their effort, they tended to report a similar level of effort as when working alone when they in fact had not.

So, we’re either unaware or unwilling to admit that we loaf.

### But Programming is Different!

The effect has also been proven to be robust across a range of activities from the simple physical task of pulling on a robe, to shouting, brainstorming, to maze solving, to evaluation of information, to typing and pushing buttons.

I think we would be misleading ourselves if we think programming to be except from the effects of social loafing.

### What Affects Social Loafing?

So social loafing is a thing and most if not all of us do it. Now what?

Social loafing does not occur at an equal strength for all tasks nor does it under all circumstances but instead seems to be affected by several factors.

Can knowledge of these factors help us in deciding when to pair program. I think they can or at least some of them can be helpful in guiding us when we build teams and try to steer our engineering culture.

I’ll skip the discussion of factors related to gender and ethnicity (women tend loaf less and so does people from eastern cultures). I'll also skip as factors that I think are detrimental to building great teams and cultures (for example we loaf less when we think our coworkers will do a bad job). Instead, I’ll focus on the factors I believe gel well with build great teams.

Go check out the [article](https://www.researchgate.net/publication/209410290_Social_Loafing_A_Meta-Analytic_Review_and_Theoretical_Integration) if your curious to know all the factors.

#### Task Valance

We loaf less when we feel we’re working on tasks that are intrinsically important.
This shouldn’t be much of a surprise.

What may come as a surprise is that it is likely that we are sensitive to how others feel and talk about a task.

Therefore: Don’t talk down the importance of tasks. Not only are you likely to bring some you own performance, but you’ll likely bring down the performance of those working with you.

While the reverse effect also exists (that is you can talk a task up and get increased performance) I’d be hesitant to use it. Instead, I’d save pair programming to talks that are actually interesting and important.

#### Task complexity

The complexity of the task at hand plays a role on social loafing. We loaf more on simple tasks than on complex tasks.

On complex tasks the effect of social loafing may even be reversed, and individuals put more effort into collaborative working than they would working on their own.

#### Uniqueness of Individual Input

We loaf less when we feel we bring something unique to the table.

While unsurprising it is still worth keeping in mind, especially when doing novice-expert pairs where the novice might feel that their input is redundant.

Stressing that learning and gaining familiarity with the codebase (and not just task solving) is the focus in novice-expert pairs might help keep the motivation up in that specific context.

#### Team Cohesiveness and Identity

Team cohesiveness and and feeling of identity plays a strong role in social loafing.

This is probably the best news of this article: Strong teams may be able to more or less completely eliminate the effect of social loafing.

#### Group Size

Social loafing increases with group size. The bigger the group the larger the effect.

**Take away:** Mob sessions are at a higher risk of social loafing, so reserve them for situations where the other factors play in your favor.

## Closing thoughts

The next time someone asks me about the reasonability of doing pair programming I think I'll change may answer from "It's at least twice as fast" to:

_"I believe that pair programming is a worthwhile investment in knowledge sharing, team building and learning - but for some tasks it will be an investment"_.

I still strongly believe that pair programming is worth the investment, but I also believe that we should be honest about it being an investment.

We invest effort and get back knowledge sharing that help reduce the risk of knowledge silos.

We invest effort and (when it works well) we help build a more cohesive team.

We invest effort and increase learning.

But a silver bullet it is not, and it comes with its own set of constraints. Knowing the factors that affect social loafing can help you make a conscious decision on when to do pair programming and get more out of the pair programming you do.

### Key Takeaways

- Social loafing scales with group size: Be especially mindful of the effect when doing mob programming

- Strong team cohesiveness is the strongest factor affecting social loafing

- Focus on the complex tasks: Quality improves with pair programming on complex tasks and complexity affects social loafing

  [^1]: [The effectiveness of pair programming: A meta-analysis](https://www.researchgate.net/publication/222408325_The_effectiveness_of_pair_programming_A_meta-analysis)
  [^2]: [Social Loafing: A Meta-Analytic Review and Theoretical Integration](https://www.researchgate.net/publication/209410290_Social_Loafing_A_Meta-Analytic_Review_and_Theoretical_Integration)
  [^3]: [The Costs and Benefits of Pair Programming](https://www.researchgate.net/publication/2333697_The_Costs_and_Benefits_of_Pair_Programming)
