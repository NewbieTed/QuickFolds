package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.Step;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StepMapper {


    Long getStepTypeByName(@Param("stepTypeName") String stepTypeName);

    @Options(useGeneratedKeys = true, keyProperty = "id")
    Long addByObj(@Param("step")Step step);

    @Options(useGeneratedKeys = true, keyProperty = "id")
    Long addByFields(@Param("origamiId") long origamiId,
                     @Param("stepType") long stepTypeId,
                     @Param("idInOrigami") int idInOrigami,
                     @Param("createdBy") String createdBy,
                     @Param("updatedBy") String updatedBy);

}
