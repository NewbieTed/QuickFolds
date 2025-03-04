# Build backend for production.
cd ..
mvn clean package -DskipTests 
cd setup

# TODO: Does this set the environment correctly? I want to be able to set prod vs local in the cmd line argument
# similarly to how we did it for frontend, where there is `npx vite build --mode prod`, `npx vite --mode dev`.
# Its not quite as automatic if I need to go and change the application.yml file myself. 

# Another note: I noticed that SecurityConfig.java has an annotation which makes it "only active in the local profile". 
# Does that mean our application is insecure when we build it for production?
