package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StepMapper {

    Long getStepTypeByName(@Param("stepType") String stepType);

    @Options(useGeneratedKeys = true, keyProperty = "id")
    Long addByFields(@Param("origamiId") long origamiId,
                     @Param("stepType") long stepTypeId,
                     @Param("idInOrigami") int idInOrigami,
                     @Param("createdBy") String createdBy,
                     @Param("updatedBy") String updatedBy);

}
