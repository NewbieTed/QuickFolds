package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StepTypeMapper {

    Long getStepTypeByName(@Param("stepTypeName") String stepTypeName);
}
