package com.quickfolds.backend.origami.service;

import com.quickfolds.backend.origami.mapper.OrigamiMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrigamiService {

    private OrigamiMapper origamiMapper;

}
