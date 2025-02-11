package com.quickfolds.backend.geometry.controller;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.mapper.GeometryMapper;
import com.quickfolds.backend.geometry.model.dto.AnnotationRequest;
import com.quickfolds.backend.geometry.model.dto.FoldRequest;
import com.quickfolds.backend.geometry.service.GeometryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/geometry")
@RequiredArgsConstructor
public class GeometryController {

    private final GeometryService geometryService;
    private final GeometryMapper geometryMapper;


    @GetMapping("/fold")
    public BaseResponse<Boolean> fold(@Valid @RequestBody FoldRequest request) {

        if (request == null) {
            return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(), "No request body provided");
        }

        return geometryService.fold(request);
    }

    @GetMapping("/annotate")
    public BaseResponse<Boolean> annotate(@Valid @RequestBody AnnotationRequest request) {
        // TODO: More checks needed
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

//        return BaseResponse.success();
        return  geometryService.annotate(request);
    }

    @GetMapping("/get/step")
    public BaseResponse<Boolean> getStep(@RequestBody long request) {


        return BaseResponse.success();
    }

}
