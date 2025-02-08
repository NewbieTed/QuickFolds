package com.quickfolds.backend.community.service;

import com.quickfolds.backend.community.mapper.CommunityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private CommunityMapper communityMapper;

}
