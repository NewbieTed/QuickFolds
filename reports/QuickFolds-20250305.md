# TA Report [Section 1]


## Goals for the Weeks:
+ Finish all of the editor for frontend
+ Finsih the first half of the viewer

## Issues
+ No issues. Testing and mac issue were resolved

## Plan for Next Week
+ test integration and finish up multifold editor/viewer
+ integrate viewer annotations

## Discussion Topics With TA
+ No current issues, maybe briefly discuss what our presentation should look like?


# Details Report [Section 2]
# Goals for the week:
#### Task: Complete the /rotate API on backend
Assignee: Yixuan Wang

Is it Finished: Yes

#### Task: Deploy all services on AWS
Assignee: Yixuan Wang, Hady Fawal

Is it Finished: Yes

#### Task: Begin /fold API for viewer on backend
Assignee: Hinyeung Lam

Is it Finished: Yes

#### Task: Complete the /annotation API on backend
Assignee: Bernice Tian

Is it Finished: Yes

#### Task: Complete Multifold
Assignee: Ryan Rozsnyai

Is it Finished: No, currently doing edits to that it becomes easier for Viewer code


#### Task: Complete Rendering for multifold / nearly finish LUG (layered undirected graph)
Assignee: Hady Fawal

Is it Finished: Yes

#### Task: Improve the UI for editor, begin process of Viewer UI and write viewer annotation frontend code
Assignee: Weizi WU

Is it Finished: Yes

---
# Progress and issues:

#### Team Member 1: Yixuan Wang

Action Items/What you did: Implemented the /rotate API, deployed all services on AWS

Result (What worked/What didn’t): All tasks are completed without any issues.

What did you learn: How to deploy services using AWS RDS, EC2, and how to run frontend and backend on a single server. 

Any Current Issues: N/A

Team Discussion if still having issues: N/A


#### Team Member 2: Hinyeung Lam

Action Items/What you did: Began implementing /fold API for viewer

Result (What worked/What didn’t): No huge issues: making process

What did you learn: More familiar with the connection between frontend and backend, and how to manage the security of token-based session authentication using springboot framework.

Any Current Issues: N/A

Team Discussion if still having issues: N/A


#### Team Member 3: Bernice Tian

Action Items/What you did: Implemented the /getStep API for annotate steps

Result (What worked/What didn't): Made progress based on last week

What did you learn: Continue to learn howw to use MyBatis result maps, Java streams, a lot more familiar with SQL queries now.

Any Current Issues: Fixed a null column issue due to miscommunication

Team Discussion if still having issues: N/A

#### Team Member 4: Ryan Rozsnyai

Action Items/What you did: Implemented the fold calculations for the controller class for Multifold now

Result (What worked/What didn’t): I had a pretty good idea of how to do it. It was just a lot of math. Now having to deal with the pains of graphs and lots of maps. I also fixed the test code issue. Brought in a new testing package

What did you learn: How to refactor code.

Any Current Issues: Mocha testing

Team Discussion if still having issues: N/A

#### Team Member 5: Weizi

Action Items/What you did: Implemented the basic front-end setup for make a fold for viewer now

Result (What worked/What didn’t): I have the barebones of the structure of making a fold working for viewer, and I've written the main code for the annotation portion of the viewer. Also got backend working!

What did you learn: Continue to learn how to connect with backend.

Any Current Issues: N/A

Team Discussion if still having issues: N/A

#### Team Member 6: Hady

Action Items/What you did: Worked on LUG: a Layered Undirected Graph. It's a new data structure that we use to render faces directly on top of each other. Deployed all services on AWS

Result (What worked/What didn’t): We had difficulting coming up with the algorithm, but realized how to think about stacking faces, and what information in needed to complete the algorithms

What did you learn: Creating our own data structure and how to think about rendering

Any Current Issues: Not particularly.

Team Discussion if still having issues: N/A


---
# Goals for next week:
### Overall Plan For This Week:
Goal is to:
+ Finish multifold on editor
+ Finish viewer
### Overall Plan For Future Weeks (big picture):
+ N/A this is the last week.
#### Task: Finish fold API for backend BY SATURDAY MORNING

Assignee: Dennis

Time Estimate: 1 week

#### Task: Finish getStep into dev and help with overall project structure

Assignee: Bernice

Time Estimate: 1 week

#### Task: Finish multiline folding

Assignee: Ryan/Hady

Time Estimate: 1 week

#### Task: Prep AWS integration to deploy quickly

Assignee: Yixuan/Hady

Time Estimate: 1 week


#### Task: Finish all parts of viewer but fold algo

Assignee: Weizi

Time Estimate: 1 week
