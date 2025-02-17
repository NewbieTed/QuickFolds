package com.quickfolds.backend.origami.mapper;


import com.quickfolds.backend.origami.model.Origami;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrigamiMapper {

    int addByObj(@Param("origami") Origami origami);

    List<Long> getPublicOrigamiIds();
}
