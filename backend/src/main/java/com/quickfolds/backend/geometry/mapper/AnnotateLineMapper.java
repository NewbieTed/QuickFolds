package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.AnnotatedLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AnnotateLineMapper {

    List<Long> getMultipleId(@Param("faceId") long faceId, @Param("idsInFace") List<Integer> idsInFace);


    void addByObj(@Param("annotatedLine") AnnotatedLine annotatedLine);

    void deleteById(@Param("annotateLineId") long annotateLineId);

    void deleteMultipleById(@Param("annotateLineIds") List<Long> annotateLineIds);

    void deleteByIdInFace(@Param("faceId") long faceId, @Param("idInFace") int idInFace);

    int deleteMultipleByIdInFace(@Param("faceId") long faceId,
                                  @Param("idsInFace") List<Integer> idsInFace,
                                  @Param("deletedStepId") long deletedStepId);

}
