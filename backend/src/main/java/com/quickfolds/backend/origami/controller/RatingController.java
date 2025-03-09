package com.quickfolds.backend.origami.controller;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.origami.model.dto.request.NewOrigamiRequest;
import com.quickfolds.backend.origami.model.dto.request.RatingRequest;
import com.quickfolds.backend.origami.model.dto.response.NewOrigamiResponse;
import com.quickfolds.backend.origami.model.dto.response.RatingResponse;
import com.quickfolds.backend.origami.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/origami")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/rate")
    public ResponseEntity<BaseResponse<RatingResponse>> rate(@Valid @RequestBody RatingRequest request) {
        return ratingService.rate(request);
    }
}
