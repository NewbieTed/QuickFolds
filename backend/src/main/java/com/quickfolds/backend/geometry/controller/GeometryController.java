package com.quickfolds.backend.geometry.controller;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.mapper.GeometryMapper;
import com.quickfolds.backend.geometry.model.dto.AnnotationRequest;
import com.quickfolds.backend.geometry.model.dto.FoldRequest;
import com.quickfolds.backend.geometry.service.GeometryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


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
            return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(), "No request body provided");
        }

        if (request.getOrigamiId() == null) {
            return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(),
                    "Field 'origamiId' in Annotate must not be null");
        }

        if (request.getStepIdInOrigami() == null) {
            return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(),
                    "Field 'stepIdInOrigami' in Annotate must not be null");
        }

//        return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(), "TEST");
        return  geometryService.annotate(request);
    }

    @GetMapping("/get/step")
    public ResponseEntity<BaseResponse<Boolean>> getStep(@RequestBody long request) {


        return BaseResponse.success();
    }

}
