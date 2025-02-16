package com.quickfolds.backend.origami.mapper;


import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface OrigamiMapper {

    List<Long> getPublicOrigamiIds();
}
