
# TA Report [Section 1]

## Goals for the Weeks:
+ Create GitHub repository and project 
+ Added basic origami Viewer code
+ Create basic algorithms for folding and backend
+ Understand the data structure for storing origami
+ Documented project requirements

## Issues
+ Writing the folding algorithm descriptively and completely; verifying that it is correct.
+ Designing a database scheme to store the origami data structure; deciding which algorithmic computations should be done in backend vs frontend.

## Plan for Next Week
+ Origami viewer: Be able to rotate, move, and click on planes to create a vertex (just get the 2D to 3D pointing to work via raycasting)
+ Finish All UI For the search engine and have the SQL commands ready. Basically, everything, apart from the process of clicking actual origami should work
+ Get AWS Backend Ready to go so Editor Team can start to save their work

## Discussion Topics With TA
+ The origami is essentially represented by a graph, and the algorithms to fold it involve traversal of that graph. Sending an entire graph from backend to frontend to do algorithmic computation may be expensive. Alternatively, holding the graph in frontend, only saving *changes* to backend, and doing graph algorithms in frontend may possible make the frontend slower. How do you think we should approach this?

# Details Report [Section 2]
# Goals for the week:
#### Task: Create GitHub repository and project
Assignee: Ryan Rozsnyai, Hady Fawal

Completed: Yes

#### Task: Add basic origami viewer code, explore Three.js
Assignee: Ryan Rozsnyai

Completed: Yes

#### Task: Complete Project Description
Assignee: Hady Fawal, Ryan Rozsnyai, Yixuan Wang, Weizi Wu, Bernice Tian, Dennis Lam

Completed: Yes

#### Task: Design and share algorithm for storing/manipulating origami objects
Assignee: Hady Fawal, Ryan Rozsnyai

Completed: Yes

#### Task: Understand basic data structure / algorithm for storing origami objects
Assignee: Yixuan Wang, Weizi Wu, Bernice Tian, Dennis Lam

Completed: Yes

---
# Progress and issues:

#### Team Member 1: Hady Fawal

Action Items/What you did: Helped set up github project and also designed a data structure to represent origami. Worked with Ryan on algorithms to manipulate the data structure.

Result (What worked/What didn’t): We have a graph-based data structure that represents the folded origami and is relatively easy to manipulate to change the state of the paper.

What did you learn: By restricting the project's initial (MVP) scope to only basic folds like the mountain and valley fold,
we actually have algorithms that catch several (though not all) errors in folding that the user might make. (By error, I mean that the user attempts a physically impossible fold.)

Any Current Issues: N/A. In the next week I will try to write these algorithms is more detail so that it becomes clear how they should be actually written in code.

Team Discussion if still having issues: N/A


#### Team Member 2: Yixuan Wang

Action Items/What you did: Completed assigned share of the project description, understand the basic algorithm for storing origami data, starting to design the database table sturctures

Result (What worked/What didn’t): Project description completed, algorithm understood

What did you learn: The basic algorithm for processing and storing origami data (data structures, how to add/edit entries, etc.)

Any Current Issues: N/A

Team Discussion if still having issues: N/A

#### Team Member 3: Weizi Wu

Action Items/What you did: Understand the basic algorithm for storing origami data, start learning how to use the Three.js library for 3D rendering, and finish writing the project documents with the rest of the team.

Result (What worked/What didn’t): Project description completed, algorithm understood, and started to have basic idea of how to use the Three.js library

What did you learn: The basic algorithm for processing and storing origami data includes data structures, the use of connected components, and methods for representing folds.

Any Current Issues: N/A

Team Discussion if still having issues: N/A

#### Team Member 4: Bernice Tian

Action Items/What you did: Completed assigned portion of project description, understand the basic algorithm for storing origami data, and start learning about databases.

Result (What worked/What didn’t): Project description completed, algorithm understood, have a basic understanding of databases.

What did you learn: The basic algorithm for processing and storing an origami model, and the general details of database tables.

Any Current Issues: N/A

Team Discussion if still having issues: N/A

#### Team Member 5: Dennis Lam

Action Items/What you did: Participated in the project description and completed the respective sections, conceptualized tools and frameworks for project, and understood the basic algorithm for storing origami data. Starting to learn basic about redis and databases.

Result (What worked/What didn’t): Project description completed, algorithm understood.

What did you learn: The basic algorithm for processing and storing origami data.

Any Current Issues: N/A

Team Discussion if still having issues: N/A

---
# Goals for next week:
### Overall Plan For This Week:
### Overall Plan For Future Weeks (big picture):

#### Task:

Assignee:

Time Estimate:
