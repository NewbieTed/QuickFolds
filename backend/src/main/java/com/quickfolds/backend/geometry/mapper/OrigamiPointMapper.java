package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.OrigamiPoint;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.SelectKey;

import java.util.List;

@Mapper
public interface OrigamiPointMapper {


    Long getIdByIdInFace(@Param("faceId") long faceId, @Param("idInFace") int IdInFace);

    List<Long> getIdsByIdInFace(@Param("faceId") long faceId, @Param("idsInFace") List<Integer> idsInFace);

    Long addByObj(@Param("origamiPoint") OrigamiPoint origamiPoint);

    int deleteMultipleByIdInFace(@Param("faceId") long faceId,
                                 @Param("idsInFace") List<Integer> idsInFace,
                                 @Param("deletedStepId") long deletedStepId);


}
