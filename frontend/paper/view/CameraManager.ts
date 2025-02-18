/**
 * @fileoverview Manages the movement of the camera and raycasting operations.
 */


import * as THREE from 'three';
import * as input from './origami_editor/editorInputCapture';


/**
 * Manages the camera object and movement of the camera in the scene.
 * As much as possible, this class's behavior is determined by external
 * callers which themselves must detect user input. If the camera is
 * not "locked," then will it detect ONLY user mouse input and update
 * itself accordingly. In all other cases, to change camera-related
 * properties you must call the public methods rather than expect it to
 * update itself.
 */
export class CameraManager {


    // Camera properties.
    private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
    private cameraType: "ORTHO" | "PERSP";
    private readonly PERSPECTIVE_CAMERA: THREE.PerspectiveCamera;
    private readonly ORTHOGRAPHIC_CAMERA: THREE.OrthographicCamera
    private raycaster: THREE.Raycaster;
    private aspect: number;
    private initialDistance: number;
    private locked: boolean;
    
    // For tracking mouse click-drag and camera rotation.
    private prevX: number | null;
    private prevY: number | null;
    private focalPoint: THREE.Vector3;
    private focalPointObj: THREE.Object3D;
    private azimuth = 0; // Angle (radians) in the xz plane, CCW from x axis.
    private altitude = 0;  // Angle (radians) between the xz plane and the line
                           // from the camera to the focal point.


    /**
     * Constructs the camera, initialized using the given scene.
     * @param scene The scene which this camera will (eventually) render.
     */
    constructor(scene: THREE.Scene) {

        this.aspect = window.innerWidth / window.innerHeight;

        // Setup the camera (perspective, orthographic)
        this.PERSPECTIVE_CAMERA = new THREE.PerspectiveCamera(
            75,             // field of view
            this.aspect,    // aspect ratio
            0.01,           // near clipping plane
            1000            // far clipping plane
        );
        this.ORTHOGRAPHIC_CAMERA = new THREE.OrthographicCamera(
            -10 * this.aspect / 2,  // left
            10 * this.aspect / 2,   // right
            10 / 2,                 // top
            -10 / 2,                // bottom
            0.01,                   // near clipping plane
            1000                    // far clipping plane
        );

        // Default to the perspective camera.
        this.camera = this.PERSPECTIVE_CAMERA;
        this.cameraType = "PERSP";

        // Create the raycaster.
        this.raycaster = new THREE.Raycaster();

        // Create focal point for the camera to look at.
        const geometrySphere = new THREE.SphereGeometry(0.05);
        const whiteMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
        this.focalPointObj = new THREE.Mesh(geometrySphere, whiteMaterial);
        this.focalPointObj.visible = input.getIsFocalPointVisible();
        this.focalPoint = new THREE.Vector3(0, 0, 0);
        scene.add(this.focalPointObj);

        // Tracking mouse movement and camera location.
        this.prevX = null;
        this.prevY = null;
        this.camera.position.x = 5;
        this.camera.position.y = 5 * Math.sqrt(2);
        this.camera.position.z = 5;
        this.camera.lookAt(this.focalPoint);
        this.initialDistance = 10;
        this.azimuth = Math.PI / 4;
        this.altitude = Math.PI / 4;
        
        // Whether movement of the camera is locked (disabled).
        this.locked = false;

        // Register event listeners.
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseScroll = this.onMouseScroll.bind(this);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('wheel', this.onMouseScroll);

    }


    /**
     * Gets the current camera being used to render the scene.
     * @returns The current camera.
     */
    public getCamera(): THREE.Camera {
        return this.camera;
    }

    /**
     * Disables camera movement.
     */
    public lockMovement() {
        this.locked = true;
    }

    /**
     * Enables camera movement.
     */
    public unlockMovement() {
        this.locked = false;
    }

    /**
     * Toggles whether the focal point of the camera should be visible.
     */
    public toggleFocalPointVisible() {
        this.focalPointObj.visible = !this.focalPointObj.visible;
    }
    
    /**
     * Updates the camera to the current window size.
     */
    public resizeWindow() {

        this.aspect = window.innerWidth / window.innerHeight;

        if (this.camera === this.PERSPECTIVE_CAMERA) {

            // Change the perspective camera.
            this.camera.aspect = this.aspect;
            this.camera.updateProjectionMatrix();

        } else if (this.camera === this.ORTHOGRAPHIC_CAMERA) {

            // Change the orthographic camera.
            this.updateOrthographic();

        }

    }

    /**
     * Toggles orthographic vs perspective camera.
     */
    public swapCameraType() {

        if (this.cameraType === "PERSP") {

            this.ORTHOGRAPHIC_CAMERA.position.set(
                this.camera.position.x, 
                this.camera.position.y, 
                this.camera.position.z
            );
            this.ORTHOGRAPHIC_CAMERA.setRotationFromEuler(
                this.camera.rotation
            );
            
            this.camera = this.ORTHOGRAPHIC_CAMERA;
            this.updateOrthographic();

            this.cameraType = "ORTHO";

        } else { // this.cameraTYPE === "ORTHO"

            this.PERSPECTIVE_CAMERA.position.set(
                this.camera.position.x, 
                this.camera.position.y, 
                this.camera.position.z
            );
            this.PERSPECTIVE_CAMERA.setRotationFromEuler(
                this.camera.rotation
            );
            this.camera = this.PERSPECTIVE_CAMERA;
            this.cameraType = "PERSP";

        }

    }

    /**
     * Moves the focal point of the camera back to the origin.
     */
    public returnToOrigin() {

        const radius = new THREE.Vector3().subVectors(
            this.camera.position, this.focalPoint
        );
        this.focalPoint = new THREE.Vector3(0, 0, 0);
        this.camera.position.copy(this.focalPoint).add(radius);
        
    }

    /**
     * Updates the scale/size of the orthographic camera
     * based on the current distance and aspect ratio.
     */
    private updateOrthographic() {

        console.log("ZOOM ORTHO");
        const distance = this.focalPoint.distanceTo(this.camera.position);
        const zoomFactor: number = distance / this.initialDistance;
        this.ORTHOGRAPHIC_CAMERA.left =  (-10 * this.aspect / 2) * zoomFactor;
        this.ORTHOGRAPHIC_CAMERA.right =  (10 * this.aspect / 2) * zoomFactor;
        this.ORTHOGRAPHIC_CAMERA.top =  (10 / 2) * zoomFactor;
        this.ORTHOGRAPHIC_CAMERA.bottom =  (-10 / 2) * zoomFactor;
        this.ORTHOGRAPHIC_CAMERA.updateProjectionMatrix();
    }

    /**
     * Moves the camera's focal point according to mouse movement.
     * @param diffX The mouse position delta X.
     * @param diffY The mouse position delta Y.
     */
    private cameraShift(diffX: number, diffY: number): void {
        
        // Calculate radial vector from camera towards focal point.
        const forwardDirection = new THREE.Vector3();
        this.camera.getWorldDirection(forwardDirection);

        // Project radial vector down onto the xz plane and normalize.
        let xzProjectNormalized = new THREE.Vector3(
            forwardDirection.x, 
            0, 
            forwardDirection.z
        ).normalize();

        // Compute how far forward the camera focal point should move.
        const forwardVector = xzProjectNormalized.multiplyScalar(diffY * 0.25);

        // Compute how far to the right the camera focal point should move.
        const upDirection = new THREE.Vector3(0, 1, 0);
        const rightVector = new THREE.Vector3().crossVectors(
            upDirection, forwardDirection
        ).normalize();
        rightVector.multiplyScalar(diffX * 0.25);

        // Move the focal point and the camera identically.
        this.focalPoint.add(forwardVector).add(rightVector);
        this.focalPointObj.position.copy(this.focalPoint);
        this.camera.position.add(forwardVector).add(rightVector);

    }

    /**
     * Rotate the camera about the focal point according to mouse movement.
     * @param diffX The mouse position delta X.
     * @param diffY The mouse position delta Y.
     */
    private cameraRotate(diffX: number, diffY: number): void {

        // Change camera angles.
        this.azimuth += diffX * 0.1;
        this.altitude += diffY * 0.05;

        // Allow the rotation, but restrict the value of the
        // azimuth angle between 0 and 2PI to prevent overflow.
        if (this.azimuth >= Math.PI * 2) {
            this.azimuth -= Math.PI * 2;
        }
        if (this.azimuth < 0) {
            this.azimuth += Math.PI * 2;
        }

        // Restrict the altitude rotation between -PI/2 and PI/2, roughly.
        this.altitude = Math.max(-Math.PI/2 + 0.1, this.altitude);
        this.altitude = Math.min(Math.PI/2 - 0.1, this.altitude);

        // Calculate the new x, y, z by converting from spherical.
        const distance = this.focalPoint.distanceTo(this.camera.position);
        const radius = new THREE.Vector3(
            distance * Math.cos(this.altitude) * Math.cos(this.azimuth),
            distance * Math.sin(this.altitude),
            distance * Math.cos(this.altitude) * Math.sin(this.azimuth)
        );

        // Update the position of the camera and where it is looking.
        this.camera.position.copy(this.focalPoint).add(radius);
		this.camera.lookAt(this.focalPoint);

    }


    /**
     * Zooms the camera in or out by changing its distance to the focal point.
     * @param deltaDistance The change in distance from the current camera's
     * distance to the focal point.
     */
    private cameraZoom(deltaDistance: number) {

        // Change the distance, cap it at a certain min and max.
        let distance: number = this.focalPoint.distanceTo(this.camera.position);
        distance +=  deltaDistance;
        distance = Math.max(0.1, distance);
        distance = Math.min(25, distance);

        const radius = new THREE.Vector3(
            distance * Math.cos(this.altitude) * Math.cos(this.azimuth),
            distance * Math.sin(this.altitude),
            distance * Math.cos(this.altitude) * Math.sin(this.azimuth)
        );

        // Update the position of the camera.
        this.camera.position.copy(this.focalPoint).add(radius);

        // If this camera is orthographic, also update its bounds.
        if (this.camera === this.ORTHOGRAPHIC_CAMERA) {
            this.updateOrthographic();
        }
        
    }


    //---------------------------------- Event Listeners -------------------------------------------//


    /**
     * Detect mouse click drag and move the camera accordingly.
     * @param event The event for holding down left click and dragging.
     */
    private onMouseMove(event: MouseEvent) {

        if (!this.locked && input.getIsLeftMousePressed()) {

            // Calculate movement of the mouse compared to location.

            const currX = event.clientX * 100 / window.innerWidth;
            const currY = event.clientY * 100 / window.innerHeight;
            let diffX = 0;
            let diffY = 0;

            if (this.prevX != null && this.prevY != null) {
                diffX = currX - this.prevX;
                diffY = currY - this.prevY;
            }

            this.prevX = currX;
            this.prevY = currY;

            // Move the camera according to the movement of the mouse.
            if (input.getIsShiftKeyPressed()) {
                this.cameraShift(diffX, diffY);
            } else {
                this.cameraRotate(diffX, diffY);
            }

        }

    }

    /**
     * When we let go of the mouse, resets recorded mouse positions
     * to prepare for the next click drag.
     * @param event The event for letting go of left click.
     */
    private onMouseUp(event: MouseEvent) {

        if (event.button === 0) {  // 0 is LMB
            this.prevX = null;
            this.prevY = null;
        }

    }

    /**
     * Detect mouse scrolling and zoom the camera accordingly.
     * @param event The event for scrolling the mouse wheel.
     */
    private onMouseScroll(event: WheelEvent) {

        if (!this.locked) {
            const deltaDistance = 0.005 * event.deltaY;
            this.cameraZoom(deltaDistance);
        }

    }

}