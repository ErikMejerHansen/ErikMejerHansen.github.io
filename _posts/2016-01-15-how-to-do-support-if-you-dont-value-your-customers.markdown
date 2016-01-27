---
layout: post
title:  "How to do support if you don’t value your customers"
date:   2016-01-27 19:39:48
categories:
---
*With helpful examples from Oracle and Philips.*

I see customer support as having a polarizing effect: It will either loose you customers or win you fans.
But winning fans via customer support takes time and effort and will only work if you actually care about your customers.

I’ve been on the receiving end of an uncaring support organization more times than I care to remember and I think I’ve spotted a few patterns emerge from those experiences that I’d like to share.

First I’ll give to examples of experiences with uncaring support.
You can skip the next two sections and just jump right ahead to the conclusion if you wish (it’s mostly just me blowing of steam anyway)

#Example 1: Oracle (circa: 2010)

A few years back I was working on a project that was mostly just SOAP messages passing trough an Oracle Enterprise Service Bus.
Basically the Service Bus would receive XML documents where parts of the document where signed. The service bus would pull out the signed parts stick them into other xml documents
and forward them to the recipient. Bread and butter stuff for a service bus.

But then the recipients started complaining of broken XML signatures. And true enough it did seem that the Service bus was breaking signatures. Specifically a component in the service bus called XMLBeans.
It was breaking the signatures by moving around namespace declarations in a way that broke the signatures.

Problem spotted and likely cause found we turned to Oracle support. Since we could point to the exact component that was causing problem and had build a small bit of code reproducing the problem then it shouldn’t be to hard get support to accept the bug and provide a solution.

Well… turns out…

When submitting a support request you had to fill around 20 fields with information about product versions, OS version and all kinds semi relevant information.
Ok, that does make some sense. But you had to fill out those fields every single time you wrote a comment or answered at questions. Every. Single. Time.  

**Pattern number one**: Make your customer jump trough hoops.  
In order to teeming masses at bay make sure it takes a lot of effort to get support. This is a war of attrition and the more hoops you have the quicker the customer will surrender.

Hoops sufficiently jumped we got the first reply from Oracle support.
“Hi. Please install this patch and see if it fixes the problem”.
The release note for that patch does not mention anything about our problem but we’ll give a shot. Didn’t fix the problem.  
**Pattern number two**: Try and look like you’re doing something.

But make sure the customer has to do the actual work. Customers just love it when it seems like you’re helping. Just make sure you don’t actually have to do any work. Supplying random software updates work great!

So we got back to Oracle and told them that the patch did not work. And so they suggested that we try installing another patch.
We did. It did not work.

Back to Oracle that then suggested we install the first patch we gave them.  
**Pattern number three**: Never read the full context. Only ever read the newest comment – remember you have 23746 other tickets to get trough today.

Back to Oracle which then told us that we we’re using xml signatures wrongly.  
**Pattern number four**: Make sure supporters can ask questions that take a lot of effort to answer.


So we reread the XML signature specs and the XML canonicalization specs. We went and got a second opinion.
We then spend hours explaining why it should work to a host of different supporters.  
**Pattern number five**: Don’t become personally involved. You might end up actually caring.

Oracle then suggested we stop using XML signatures.  
**Pattern number six**: Try to convince the customer that they don’t really need that feature.

Oracle then said: The error is not in a component we made.

**Pattern number seven**: Shift the blame. If you can get the customer to go elsewhere with his problem then you won.
Sure it’s in a component that is part of our product – but we did not write that component. Go talk to those guys.

But then after *two years* we finally got the patch we needed.

#Example 2: Philips (2015-2016)

This second example is from the consumer space. I went and bought a Philips TV (Model: 50/PUS6809/12. Do not by that TV.).
It quickly turned out to have a host of problems:

- Randomly turning on 3D mode
- Randomly turn down the contrast by 50%
- Show “Certificate expired” error messages that cannot be dismissed
- Unable to wake up from Stand-By
- Suddenly Hobbit stopped working.

And the dummy I am I turned to support instead of just returning the TV.

Philips: Please install this update (that has nothing to do with any of the errors you are experiencing)  
**Pattern number two:** Try and look like you’re doing something

Philips: Please “reinstall your TV” loosing all your settings in the process.  
**Pattern number one:** Make your customer jump trough hoops.

Philips: The TV stations changed the way they are doing HbbTv.  
**Pattern number seven:** Shift the blame.

Philips: Please provide screenshots of the errors and please provide information on signal strength for all your channels.  
**Pattern number four:** Make sure supporters can ask questions that take a lot of effort to answer.

Philips: Try turning off HbbTV  
**Pattern number six:** Try to convince the customer that they don’t really need that feature.

Philips: Ok, just one more question.  
**Pattern number eight:** Feign progress. At some point the customer is going to get angry. That means you’re close to winning the war of attrition. So pretend to have only a few more questions.
But make sure you have plenty of hoops left for the customer to jump tough.

Eventually I gave up after dealing with Philips support for three months.

#Conclusion

In case you skipped the last two sections I’ll summarize the patterns for doing horrible support:

1. Make your customer jump trough hoops
2. Try and look like you’re doing something
3. Never read the full context. Only ever read the newest comment
4. Make sure supporters can ask questions that take a lot of effort to answer
5. Don’t become personally involved. You might end up actually caring.
6. Try to convince the customer that they don’t really need that feature.
7. Shift the blame.
8. Feign progress.

Neither Oracle nor Philips are dumb organizations. They have just figured out that you only need their support after they have made their sale.
That means support is just something that eats into their margins.

Obviously if people were to ask me if they should use an Oracle Enterprise Service Bus or by a Philips TV I would advice against it.
And equally obviously is not hurting them enough or they would have changed their tactics.

But if you’re a small business and each individual customer actually has an impact on your business I would suggest you reverse the patterns outlined above:

1. Make getting support as easy as possible
2. Do something to help the customer
3. Know the full context before answering the customer.
4. Make sure the customer has to work as little as possible
5. Do become personally involved. Actually care.
6. Take responsibility for your features.
7. Own up to your mistakes.
8. Provide honest status updates.

*Ending on a up note: It’s been 4 years since I last used a service bus and I now watch way less TV.*
