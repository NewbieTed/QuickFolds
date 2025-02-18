package com.quickfolds.backend.origami.mapper;

import com.quickfolds.backend.origami.model.database.Origami;
import com.quickfolds.backend.origami.model.dto.response.OrigamiResponse;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrigamiMapper {

    Long getMostRecentId(@Param("userId") Long userId);

    List<Long> getPublicOrigamiIds();

    List<OrigamiResponse> getPublicOrigamis();

    void addByObj(@Param("origami") Origami origami);


}
