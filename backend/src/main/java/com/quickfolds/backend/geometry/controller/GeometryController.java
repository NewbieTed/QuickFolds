package com.quickfolds.backend.geometry.controller;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.model.dto.AnnotationRequest;
import com.quickfolds.backend.geometry.model.dto.FaceAnnotateRequest;
import com.quickfolds.backend.geometry.model.dto.FoldRequest;
import com.quickfolds.backend.geometry.service.GeometryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/geometry")
@RequiredArgsConstructor
public class GeometryController {
    
    private final GeometryService geometryService;


    @GetMapping("/fold")
    public ResponseEntity<BaseResponse<Boolean>> fold(@Valid @RequestBody FoldRequest request) {

        if (request == null) {
            return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(), "No request body provided");
        }

        return geometryService.fold(request);
    }

    @PostMapping("/annotate")
    public ResponseEntity<BaseResponse<Boolean>> annotate(@Valid @RequestBody AnnotationRequest request) {
        // TODO: More checks needed
        System.out.println("Inside annotate controller method");
        if (request == null) {
            String errorMessage = "Request is null," +
                    " verify if request is valid (null request)";
            throw new IllegalArgumentException(errorMessage);
        }

        if (request.getOrigamiId() == null) {
            String errorMessage = "Origami id is null," +
                    " verify if request is valid (null origami id)";
            throw new IllegalArgumentException(errorMessage);
        }

        if (request.getStepIdInOrigami() == null) {
            String errorMessage = "Step id in origami is null," +
                    " verify if request is valid (null step id in origami)";
            throw new IllegalArgumentException(errorMessage);
        }

        List<FaceAnnotateRequest> faces = request.getFaces();

        if (faces == null) {
            String errorMessage = "faces list is null," +
                    " verify if request is valid (null faces list)";
            throw new IllegalArgumentException(errorMessage);
        }

        if (faces.isEmpty()) {
            String errorMessage = "faces list is empty," +
                    " verify if request is valid (empty faces list)";
            throw new IllegalArgumentException(errorMessage);
        }

        return  geometryService.annotate(request);
    }

    @GetMapping("/get/step")
    public ResponseEntity<BaseResponse<Boolean>> getStep(@RequestBody long request) {


        return BaseResponse.success();
    }

}
