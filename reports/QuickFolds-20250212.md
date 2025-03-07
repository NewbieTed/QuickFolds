# TA Report [Section 1]

## Goals for the Weeks:
+ Task: Front end: Get the __structure__ of front end done so that by the time next week roles around, we can send a request to backend and display the result (either on the viewer, or the search feature)

+ Task: Back end: Get basic POST requests set up. This includes the code and infrastructure. The idea is to have the API request set up by next week so frontend can __immediately__ start calling it so they can render the results.

## Issues
+ No real issues, set-up is essentially ready and all tasks requested are done. Only delay is with getting sql testing integrated with backend

## Plan for Next Week
+ Get Presentation Slides Ready
+ Finish Creating annotation points/lines and save them to backend
+ "Publish" a model
+ Be able to load existing public origami on the Search Engine
+ Get backend testing fully ready as we plan to connect frontend and backend together so can now finsih this part up


## Discussion Topics With TA
+ No major issues. Current Plan is to finish up the "line of connection" between front and back-end and get sql testing fully integrated. If you have any concerns please let us know.

# Details Report [Section 2]
# Goals for the week: Get Front and Backend Primed so we can connect the two before beta release week
#### Task: Create Frontend Testing + Linter
Assignee: Ryan Rozsnyai

Is it Finished: Yes

#### Task: Create Base Controller Setup
Assignee: Ryan Rozsnyai

Is it Finished: Yes

#### Task: Create Base Viewer Setup + Raycast fine tuning
Assignee: Weizi Wu

Is it Finished: Yes

#### Task: Set up TS files for all modules
Assignee: Hady Fawal

Is it Finished: Yes

#### Task: Set Up Point 2D/3D Module
Assignee: Hady Fawal

Is it Finished: Yes

#### Task: Set Up Local Backend Post Request For /annotate
Assignee: Yixuan Wang

Is it Finished: Yes

#### Task: Set Up all the DB so Backend Can add to tasks
Assignee: Yixuan Wang

Is it Finished: Yes


#### Task: Set Up base backend framework so can continue with connection testing
Assignee: Bernice Tian

Is it Finished: Yes

#### Task: Update Project Doc with Backend Testing
Assignee: Bernice Tian

Is it Finished: Yes

#### Task: Create /user/signup and /user/login (Implemented JWT-based authentication)
Assignee: Dennis Lam

Is it Finished: Yes

#### Task: Hash Passwords via BCrypt before being stored in the database, update Yml correspondingly
Assignee: Dennis Lam

Is it Finished: Yes

---
# Progress and issues:


#### Team Member 1: Hady Fawal

Action Items/What you did: Set up all the holder TS files in all modules and worked on the Geometry Modules

Result (What worked/What didn’t): No real issues in setting this up, last week's archiecture design for frontend got rid of most of the issues that would have appeared this week if not for the pre-work.

What did you learn: How to set up a large TypeScript frontend structure/basic unit testing with Mocha

Any Current Issues: N/A

Team Discussion if still having issues: N/A

#### Team Member 2: Dennis Lam

Action Items/What you did: Added New endpoints which are /user/signup and /user/login. I implemented this with JWT-based authentication, and encrypted passwords.

Result (What worked/What didn’t): We had a bit of trouble setting up security with unit testing. Worked on unit testing and added a virtual user token and edited the csrfToken to give permissions to unit tests.

What did you learn: Setting up JWT-based authentication and csrfTokens.

Any Current Issues: N/A

Team Discussion if still having issues: N/A


#### Team Member 3: Ryan Rozsnyai

Action Items/What you did: Create Frontend Testing + Linter, Create Base Controller Setup

Result (What worked/What didn’t): I ended up using the direct ESLint module instead of a third party called GTS (which was a memory leak program) for linting and Mocha for Unit Testing

What did you learn: How to Set up a YML file, I've never done this before

Any Current Issues: None.

Team Discussion if still having issues: N/A


#### Team Member 4: Bernice Tian

Action Items/What you did: Help Set up backend testing and focusing on integrating SQL tests into current project.

Result (What worked/What didn’t): Got mockito set up with does the main base of mapper logic (ie you can check that the correct methods were called with the correct objects the correct number of times) and am now halfway through setting up DBUnit which allows for sql tests.

What did you learn: Mockito, DBUnit, general backend frameworks structure, dependencies, maven.

Any Current Issues: Currenlty getting DBUnit integrated into project, progress is slower than expected.

Team Discussion if still having issues: N/A at this point



#### Team Member 5: Yixuan Wang

Action Items/What you did: Set up base structure for /annotate point requests and DB creation, helped write base DB unit tests.

Result (What worked/What didn’t): No real issues in setting up, base structure is ok. One small issue that we discovered was integrating security into our testing, as we were locked out of our own APIs once we added JWT. Ended up fixing it via adding user permissions through a virtual user token.

What did you learn: How to set up a Spring Boot application and csrfTokens.

Any Current Issues: N/A

Team Discussion if still having issues: N/A


#### Team Member 6: Weizi Wu

Action Items/What you did: Get Viewer Module Prepped up with raycast actions so that we can hook up connections this coming week.

Result (What worked/What didn’t): Eventually got base raycasting/shooting working by using a combination of provided functions Three.js provides/in conjuections with some of the planned objects the editor will contain

What did you learn: How raycasts work [never used Three.js before this]

Any Current Issues: not really, just fine turning

Team Discussion if still having issues: N/A






---
# Goals for next week:
### Overall Plan For This Week: Get beta release ready to go, establish a line of connection, and set up presentation slide deck
### Overall Plan For Future Weeks (big picture): At a high level, the goal is to add features: annotations, folding, stack visualization, viewer. Backend will follow suit with endpoints as needed

#### Task:

Task: Get Presentation Slides Ready

Assignee: Ryan Rozsnyai

Time Estimate: 1 Week


Task:

+  Have 5 buttons on editor
+ Add annotation pt
+ Delete annotation pt
+ Add annotation line
+ You click two existing points to make a line
Delete annotate line
+ You click two existing points to delete a line
+ “A publish origami/finish” button
+ All four buttons should integrate to backend via the /annotate button {controller}
+ The finish/public button should send a request to backend via the /publish area
+ All four buttons should update the paper graph {controller}

Assignee: Front end team

Time Estimate: 1 Week


Task:

+ Have /annotation request ready friday night so frontend can work out issues putting the two together bc there will be issues….
+ Have /display and /public request ready by saturday night so frontend can load newly created origami and deal with this saturday/sunday
+ Add Documentation to all code to make it look nice (we are graded on this)


Assignee: Backend end team

Time Estimate: 1 Week




