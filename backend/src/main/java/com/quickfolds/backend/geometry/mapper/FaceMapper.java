package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.Face;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FaceMapper {

    Long getIdByFaceIdInOrigami(@Param("origamiId") long origamiId,
                                @Param("faceIdInOrigami") int faceIdInOrigami);


    void addByObj(@Param("face") Face face);
}
