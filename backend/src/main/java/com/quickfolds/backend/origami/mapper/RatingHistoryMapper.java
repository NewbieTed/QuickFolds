package com.quickfolds.backend.origami.mapper;

import com.quickfolds.backend.origami.model.database.RatingHistory;
import com.quickfolds.backend.origami.model.dto.request.RatingRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RatingHistoryMapper {


    RatingHistory getObjByUserIdOrigamiId(@Param("userId") Long userId, @Param("origamiId") Long origamiId);
}
