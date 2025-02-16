package com.quickfolds.backend.origami.service;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.origami.mapper.OrigamiMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrigamiService {

    private OrigamiMapper origamiMapper;

    public ResponseEntity<BaseResponse<List<Long>>> list() {

        List<Long> ids = origamiMapper.getPublicOrigamiIds();

        if (ids == null) {
            return BaseResponse.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Error getting data from database");
        }

        return BaseResponse.success(ids);
    }
}
