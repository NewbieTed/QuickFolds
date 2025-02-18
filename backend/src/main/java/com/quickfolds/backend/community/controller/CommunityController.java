package com.quickfolds.backend.community.controller;

import com.quickfolds.backend.community.mapper.CommunityMapper;
import com.quickfolds.backend.community.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
public class CommunityController {

    private CommunityService communityService;
    private CommunityMapper communityMapper;
}
