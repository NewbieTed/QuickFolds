# TA Report [Section 1]

## Goals for the Weeks:
+ Get Presentation Slides Ready
+ Finish Creating annotation points/lines and save them to backend
+ "Publish" a model
+ Be able to load existing public origami on the Search Engine
+ Get backend testing fully ready as we plan to connect frontend and backend together so can now finsih this part up


## Issues
+ No issues. Only thing not done from this list above is doing a "publish" button. BETA presentation will just autoset model public (although the code will leave it private)

## Plan for Next Week
+ Add robustness to user input for points/lines creation
+ Add basic rotations (basic as in we don't collapse a plane, that's the final task week after)
+ Create user accounts and integrate fully into DB, so we don't have to run the dummy alice SQL code anymore

## Discussion Topics With TA
+ N/A. As always, please mention if you have any concerns.

# Details Report [Section 2]
# Goals for the week:
#### Task: Finish Backend Basic Annotate feature
Assignee: Yixuan Wang

Is it Finished: Yes

#### Task: Finish Backend Create New Origami feature
Assignee: Yixuan Wang

Is it Finished: Yes

#### Task: Add Backend Tests on Users and Origami
Assignee: Dennis Lam

Is it Finished: Yes

#### Task: Finish Backend Get Public Origami List Feature
Assignee: Bernice Tian

Is it Finished: Yes

#### Task: Create Entire Controller Module
Assignee: Ryan Rozsnyai

Is it finished: Yes

#### Task: Create Entire Paper Module
Assignee: Ryan Rozsnyai

Is it finished: Yes

#### Task: Add line buttons and hook up Every buttons to Controller Module
Assignee: Ryan Rozsnyai

Is it finished: Yes

#### Task: Create Community Board
Assignee: Ryan Rozsnyai

Is it finished: Yes

#### Task: Hook Up Every API to Backend
Assignee: Ryan Rozsnyai

Is it finished: Yes

#### Task: Add Publish Button
Assignee: Ryan Rozsnyai

Is it finished: No

#### Task: Add Publish Button
Assignee: Ryan Rozsnyai

Is it finished: No

#### Task: Add background picture
Assignee: Weizi Wu

Is it finished: Yes

#### Task: Add annotation points/lines
Assignee: Weizi Wu

Is it finished: Yes

#### Task: Delete scroll bar
Assignee: Weizi Wu

Is it finished: Yes

#### Task: Create the Face3D class
Assignee: Hady Fawal

Is it finished: Yes

#### Task: Create the Face2D class
Assignee: Hady Fawal

Is it finished: Yes

#### Task: Create the Point types and utilities
Assignee: Hady Fawal

Is it finished: Yes

#### Task: Create the SceneManager
Assignee: Hady Fawal

Is it finished: Yes

#### Task: Refactor the editor into CameraManager
Assignee: Hady Fawal

Is it finished: Yes

#### Task: Add basic animation framework
Assignee: Hady Fawal

Is it finished: Yes


---
# Progress and issues:

#### Team Member 1: Yixuan Wang

Action Items/What you did: Completed backend geometry/annotate API, and completed origami/new API

Result (What worked/What didn’t): backend geometry/annotate API basic version complete (need to write more to handle the various edge cases), origami/new API complete

What did you learn: SQL, setting up DB on Github Actions

Any Current Issues: N/A

Team Discussion if still having issues: N/A


#### Team Member 2: Ryan Rozsnyai

Action Items/What you did: I created 2 entire modules for frontend, hooked up all active APIs with backend, and connected all modules together.

Result (What worked/What didn’t): I had a bit of issue hooking up the community board to the editor due to swapping webpages. I used session storage cookies, but discovered Mocha crashes when using local storage. I had to create a mock object to solve this.

What did you learn: I had a lot of tasks this week. Planning to distribute more evenly next week.

Any Current Issues: N/A, just a lot of things done

Team Discussion if still having issues: N/A


#### Team Member 3: Bernice Tian

Action Items/What you did: Completed backend origami/list api

Result (What worked/What didn’t): backend origami/list api complete

What did you learn: SQL, how to set up environment variables from .env files on windows, unit testing controllers with MockMvc

Any Current Issues: N/A

Team Discussion if still having issues: N/A


#### Team Member 4: Weizi Wu

Action Items/What you did: Completed frontend 3D rendering, community board UI integration.

Result (What worked/What didn’t): Annotation points and lines are rendered, adding and deleting them are supported.

What did you learn: Three.js rendering

Any Current Issues: I still feel the need to learn more about frontend libraries.

Team Discussion if still having issues: N/A

#### Team Member 5: Hady Fawal

Action Items/What you did: Created the geometry module which renders faces in 3D, mutates faces in 2D, and offers utilities to handle point and vector math. Created
the scene manager which controls all the faces in the scene, and refactored the camera.

Result (What worked/What didn’t): Automatic management of faces, annotations in faces, and complex intersection calculations. Clean camera movement and rotation.

What did you learn: I learned a lot about how to use Three.js, and also a fair amount 3D mathematics to do things like projection, finding certain distances, etc.

Any Current Issues: N/A

Team Discussion if still having issues: N/A

---
# Goals for next week:
### Overall Plan For This Week:
+ Add robustness to user input for points/lines creation
+ Add basic rotations (basic as in we don't collapse a plane, that's the final task week after)
+ Create user accounts and integrate fully into DB, so we don't have to run the dummy alice SQL code anymore
### Overall Plan For Future Weeks (big picture):
+ The final tasks is being able to fold recursively (ie if I flatten a paper in half, it renders and folds again)

#### Task: Add Robustness to user input for points/lines creation. For example, if the user cancels halfway, the entire system breaks. Fix these edge cases. Just try to break the input part of the system. Think of it like error handling

Assignee: Weizi Wu

Time Estimate: 1 week


#### Task: Add New button to fold an origami. Click the line that causes the intersection. Have user error handling.

Assignee: Weizi Wu

Time Estimate: 1 week

### Task: Include the ability to do when raycasting and adding a point, have the point appear on the edge. (ie the isCloseToEdge method)

Assignee: Weizi Wu

Time Estimate: 1 week


### Task: Make the UI more interactive when doing actions on the editor:

+ When adding a point, hilight where the point will be (think of like the blue point when click, but continous), even when the mouse isn't being pressed. The idea is the user should know where the point will be created once clicked.

+ When selecting a line/point to delete, hilight the point/line to the user know what they are selecting. (note: hady will provide a method for you to update the color of a given point)

Assignee: Weizi Wu

Time Estimate: 1 week

#### Task: Make the update to controller so that user can add point to edge. This should be at most 20 lines of small changes

Assignee: Weizi Wu

Time Estimate: 1 week

#### Task: Calculate the new planes/lines that are generated from fold in paper module in the recursive handling

Assignee: Ryan Rozsnyai

Time Estimate: 1 week

#### Task: Update controller class to account for this error handling. IE don't be throwing errors, but tell user

Assignee: Ryan Rozsnyai

Time Estimate: 1 week

#### Task : Add UI code to display error message during editor to user. Should be JS anim animation

Assignee: Ryan Rozsnyai

Time Estimate: 1 week


#### Task : Create Paper Class to handler spliting planes when rendering

Assignee: Ryan Rozsnyai

Time Estimate: 1 week

#### Task : Given a new fold, update the renderer so that the animation is smooth.

Assignee: Hady Fawal

Time Estimate: 1 week


#### Task : Start progress on rendering multiple layers. We won't use the code this week, but try to get some set up to make it easier next week.

Assignee: Hady Fawal

Time Estimate: 1 week


#### Task : Create user account page. Do oth front and back end. Make sure to integrate it into the current frontend structure without making any big changes.

Assignee: Dennis Lam

Time Estimate: 1 week

#### Task : Create the User Origami Pages. Do both front and backend for this. Should be a simple API that activates the viewer.

Assignee: Dennis Lam

Time Estimate: 1 week

#### Task : Create the UI for the Viewer module. Have the ability to do playback for the points content.

Assignee: Dennis Lam

Time Estimate: 1 week

#### Task : Update the community board UI. When I click on an origami, I should go to the viewer. Also implement frontend filter (ie the search bar)

Assignee: Dennis Lam

Time Estimate: 1 week

#### Task : Add the ability to query the community board API

Assignee: Bernice Tian

Time Estimate: 1 week

#### Task : Create the basic API for viewing. For now, we will only have creating/deleting points adding/deleting lines. But try to write your code with the fact that we will have other content in mind.

Assignee: Bernice Tian

Time Estimate: 1 week


#### Task : Create the /fold API on the editor. Try to get the basic no complete fold set up. Keep in mind that we will start up the folding multiple piece of paper at the same time so keep in mind this API will have to update. [ONLY ONE PERSON GIVEN TASK SINCE IT NEEDS TO BE DONE WELL]

Assignee: Yixuan Wang

Time Estimate: 1 week