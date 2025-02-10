package com.quickfolds.backend.geometry.service;

import com.quickfolds.backend.geometry.mapper.GeometryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GeometryService {

    private GeometryMapper geometryMapper;

}
