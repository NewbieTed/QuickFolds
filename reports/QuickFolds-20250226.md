# TA Report [Section 1]


## Goals for the Weeks:
+ Add robustness to user input for points/lines creation
+ Add basic rotations (basic as in we don't collapse a plane, that's the final task week after)
+ Create user accounts and integrate fully into DB, so we don't have to run the dummy alice SQL code anymore

## Issues
+ No glaring issues. Just a lot of work
+ small debate about mocha issue (see discussion topics)

## Plan for Next Week
+ Create multifolds on frontend
+ Create viewer for annotations and get halfway on folds

## Discussion Topics With TA
+ Debating the remaining timeframe of tasks. We want your input on all the tasks we have to complete in two weeks.
  + Create multiline fold on frontend
  + Create viewer (both annotations and folds)
  + Set up aws
+ Frontend is dealing with a bit of trouble with Mocha. When we do include ts files in our unit tests, however, from what we can tell, Mocha has issues with deal with the extension. We are trying to debug this, but not sure how to fix at the moment. An example of this is trying to test `createSplitFace` in paper manager


# Details Report [Section 2]
# Goals for the week:
#### Task: Complete the /fold API on backend
Assignee: Yixuan Wang

Is it Finished: Yes

#### Task: Complete signup/login feature on frontend
Assignee: Hinyeung Lam

Is it Finished: Yes

#### Task: Complete searching origami by author on frontend
Assignee: Hinyeung Lam

Is it Finished: Yes

#### Task: Complete the /getStep API for annotations on backend
Assignee: Bernice Tian

Is it Finished: Still needs to be tested, but otherwise yes


#### Task: Complete single line fold on frontend for controller module
Assignee: Ryan Rozsnyai

Is it Finished: Yes

#### Task: Improve the UI for editor
Assignee: Weizi

Is it Finished: Yes

#### Task: Complete single line fold on frontend for editor module
Assignee: Weizi

Is it Finished: Yes

---
# Progress and issues:

#### Team Member 1: Yixuan Wang

Action Items/What you did: Implemented the /fold API, tested the API with Postman, wrote tests for OrigamiService.

Result (What worked/What didn’t): All tasks are completed without any issues.

What did you learn: Setting up DB tests on GitHub Actions, testing with more automation.

Any Current Issues: N/A

Team Discussion if still having issues: N/A


#### Team Member 2: Hinyeung Lam

Action Items/What you did: Implemented the signup/login feature on frontend, refine the token-based signup/login APIs on backend, add searching feature of origami by author on frontend

Result (What worked/What didn’t): All tasks are complete.

What did you learn: More familiar with the connection between frontend and backend, and how to manage the security of token-based session authentication using springboot framework.

Any Current Issues: N/A

Team Discussion if still having issues: N/A


#### Team Member 3: Bernice Tian

Action Items/What you did: Implemented the /getStep API for annotate steps

Result (What worked/What didn't): We assumed that the /getStep API would be able to reuse some already created methods to implement its logic, but this was actually not the case since this API focuses on retrieving data from the DB while other APIs focus more on inserting data into the DB. As a result implementation took longer than expected and no tests have been written yet.

What did you learn: How to use MyBatis result maps, Java streams, a lot more familiar with SQL queries now.

Any Current Issues: N/A

Team Discussion if still having issues: N/A

#### Team Member 4: Ryan Rozsnyai

Action Items/What you did: Implemented the fold calculations for the controller class.

Result (What worked/What didn’t): I had a pretty good idea of how to do it. It was just a lot of math. Ended up moving a lot of code to the paper graph module since there was a lot of plane calculations involving basis in R3

What did you learn: How to refactor code.

Any Current Issues: Mocha testing

Team Discussion if still having issues: N/A

#### Team Member 5: Weizi

Action Items/What you did: Implemented the basic front-end setup for make a fold

Result (What worked/What didn’t): I have the barebones of the structure of making a fold working, but I need to fix some bugs for better performance. I have a big problem with setting up the back-end environment on my laptop, and I currently have no idea what to do with that.

What did you learn: How to read the documentation and code written by other contributors and try to use them.

Any Current Issues: Setting up the backend

Team Discussion if still having issues: N/A

#### Team Member 6: Hady

Action Items/What you did: 

Result (What worked/What didn’t): 

What did you learn: 

Any Current Issues: 

Team Discussion if still having issues: N/A


---
# Goals for next week:
### Overall Plan For This Week:
Goal is to:
+ Finish all of the editor for frontend
+ Finsih the first half of the viewer
### Overall Plan For Future Weeks (big picture):
+ Finish this week, then have the viewer team finish up multiline stuff next week, while those not on that team will do aws + other clean up
#### Task: Finish the annotations part of viewer and start the first part of folding

Assignee: Bernice/Dennis

Time Estimate: 1 week

#### Task: Finish multiline folding

Assignee: Ryan/Hady/Weizi

Time Estimate: 1 week

#### Task: Help viewer backend if needed, and start looking at AWS integration

Assignee: Yixuan

Time Estimate: 1 week
