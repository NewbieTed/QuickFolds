package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.AnnotatedPoint;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AnnotatePointMapper {


    Long getIdbyIdInFace(@Param("faceId") long faceId, @Param("idInFace") int IdInFace);

    void addByObj(@Param("annotatedPoint") AnnotatedPoint annotatedPoint);

    void deleteMultipleByIdInFace(@Param("faceId") long faceId,
                                  @Param("idsInFace") List<Integer> idsInFace,
                                  @Param("deletedStepId") long deletedStepId);
}
