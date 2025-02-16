package com.quickfolds.backend.origami.controller;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.model.dto.FoldRequest;
import com.quickfolds.backend.origami.mapper.OrigamiMapper;
import com.quickfolds.backend.origami.service.OrigamiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/origami")
@RequiredArgsConstructor
public class OrigamiController {

    private final OrigamiService origamiService;


    @PostMapping("/new")
    public ResponseEntity<BaseResponse<Boolean>> newOrigami(@Valid @RequestBody FoldRequest request) {

        return BaseResponse.success();
    }

    @GetMapping("/list")
    public ResponseEntity<BaseResponse<List<Long>>> getAll() {

        return origamiService.list();
    }


}
