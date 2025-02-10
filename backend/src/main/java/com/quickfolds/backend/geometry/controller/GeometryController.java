package com.quickfolds.backend.geometry.controller;

import com.quickfolds.backend.geometry.mapper.GeometryMapper;
import com.quickfolds.backend.geometry.service.GeometryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/geometry")
@RequiredArgsConstructor
public class GeometryController {

    private GeometryService geometryService;
    private GeometryMapper geometryMapper;

}
