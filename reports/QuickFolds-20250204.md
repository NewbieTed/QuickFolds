
# TA Report [Section 1]

## Goals for the Weeks:
+ Create the ability to click on the mouse and "click" a plane. To be more formal, I want to know the point in which you hit a plane.
+ Be able to take a point on a plane, and find the closest point on an edge of the plane. (i.e. given a point, what is the closest spot to the edge of the vertex?).
+ Finish up dolly cam rotation between ortho and perspective camera. Set up modular structure for front end. Help other frontend team members if needed.
+ Finish Up UI For the search engine and have the SQL commands ready. Basically, everything, apart from the process of clicking actual origami should work.
+ Database Schema. Come up with a high level way to store our data.
+ Get AWS Backend Ready to go so Editor Team can start to save their work
## Issues
+ No real issues/stuck points. Architecture took more time than expected, delaying other stacks.

## Plan for Next Week
+ Get the structure of front end going so that by next week we can start sending request so we have a connection to show during the Beta.

## Discussion Topics With TA
+ Confirm the features/thing needed to be implemented by Beta release [have a line from front to back]. How much of the editor and either search feature or viewer need to be done for the Beta since we need to establish a line of connection.

# Details Report [Section 2]
# Goals for the week:
#### Task: Design database schema
Assignee: Yixuan Wang

Completed: Yes


#### Task: Setup backend environment
Assignee: Yixuan Wang

Completed: Yes


#### Task: Create AWS Database
Assignee: Yixuan Wang

Completed: Yes

#### Task: Set Orthographic/Perspective Camera Swap
Assignee: Ryan Rozsnyai

Completed: Yes

#### Task: Create the ability to click on the mouse and "click" a plane. Find the point in space at which you hit a plane.
Assignee: Hady Fawal

Completed: No

---
# Progress and issues:

#### Team Member 1: Yixuan Wang

Action Items/What you did: Designed database schema for storing data from frontend. Completed basic framwork setup for the backend so that other team members can start on writing the code. Setting up AWS for future use.

Result (What worked/What didn’t): Database schema completed and verified. Backend framework is now ready and the current Maven build is successful. AWS database is now set up.

What did you learn: Methods on setting up a Spring Boot environment on Maven, database design choices.

Any Current Issues: N/A

Team Discussion if still having issues: N/A

#### Team Member 2: Ryan Rozsnyai

Action Items/What you did: Set up orthograpic/perspective camera. Assisted with frontend structure

Result (What worked/What didn’t): Wanted to do a dolly zoom between the two, but did a bit of research and
discovered that most 3d models just do a hard cut, so I implement that instead.

What did you learn: Three.js pointers when rendering scenes and multicamera work

Any Current Issues: N/A

Team Discussion if still having issues: N/A

#### Team Member 3: Hady Fawal
Action Items/What you did: I spent the majority of my time this week designing the architecture of the frontend origami editor/viewer, and discussing with backend folks about the necessary data which will be sent, so that they could design their schema. While I did not complete the explicitly assigned task "Create the ability to use the mouse to 'click' a plane," in the rest of my time I did some research and learned about Three.js raycasting.

Result (What worked/What didn't): We now have a relatively clear, modular architecture to follow for implementatation. I also have a better idea of where in that architecture the raycasting task I was assigned will be done, and so it should be fairly quick to implement in the future.

What did you learn: How to architect a system and draw the diagrams; how to raycast in Three.js depending on the type of camera (Orthographic vs Perspective) being used to view the scene.

#### Team Member 4: Dennis Lam

Action Items/What you did: Designed database schema for user information as in authentication and for storing data from frontend. Setting up AWS RDS database for future use.

Result (What worked/What didn’t): Database schema completed and verified. AWS database is now set up.

What did you learn: Database architecture and design choices. Methods on setting up a Spring Boot environment on Maven.

Any Current Issues: N/A

Team Discussion if still having issues: N/A
---
# Goals for next week:
### Overall Plan For This Week:
+ Front end [Ryan, Hady, Weizi]: Get the __structure__ of front end done so that by the time next week roles around, we can immediately send a request to backend and work on displaying the result (either on the viewer, or the search feature)

### Overall Plan For Future Weeks (big picture):

> Get a frond end and back end connection set up by the beta release. This means __a lot__ of coding over the next two weeks.

#### Task: Front end: Get the __structure__ of front end done so that by the time next week roles around, we can send a request to backend and display the result (either on the viewer, or the search feature)
Assignee: [Hady, Ryan, Weizi]

Time Estimate: 1 Week

#### Task: Back end: Get basic POST requests set up. This includes the code and infrastructure. The idea is to have the API request set up by next week so frontend can __immediatly__ start calling it so they can render the results.
Assignee: [Bernice, Dennis, Yixuan]

Time Estimate: 1 Week