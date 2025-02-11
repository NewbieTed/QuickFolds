package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FaceMapper {

    Long getIdByFaceIdInOrigami(@Param("origamiId") long origamiId,
                                @Param("faceIdInOrigami") int faceIdInOrigami);


}
