package com.quickfolds.backend.origami.controller;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.origami.model.dto.request.NewOrigamiRequest;
import com.quickfolds.backend.origami.model.dto.response.NewOrigamiResponse;
import com.quickfolds.backend.origami.model.dto.response.OrigamiListResponse;
import com.quickfolds.backend.origami.model.dto.response.OrigamiResponse;
import com.quickfolds.backend.origami.service.OrigamiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/origami")
@RequiredArgsConstructor
public class OrigamiController {

    private final OrigamiService origamiService;


    @PostMapping("/new")
    public ResponseEntity<BaseResponse<NewOrigamiResponse>> newOrigami(@Valid @RequestBody NewOrigamiRequest request) {

        return origamiService.newOrigami(request);
    }

    @GetMapping("/list")
    public ResponseEntity<BaseResponse<OrigamiListResponse>> getAll() {

        return origamiService.list();
    }
}
