package com.quickfolds.backend.geometry.mapper;


import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface GeometryMapper {

    Long getStepTypeByName(@Param("stepType") String stepType);

    void addStep(@Param("origamiId") long origamiId,
                 @Param("stepType") long stepTypeId,
                 @Param("idInOrigami") int idInOrigami);

    void deleteFaceByIdInOrigami(@Param("faceId") int faceId);


    void deleteLineByIdInOrigami(@Param("origamiId") long origamiId,
                                 @Param("lineId") int lineId,
                                 @Param("stepId") int stepId);




}
