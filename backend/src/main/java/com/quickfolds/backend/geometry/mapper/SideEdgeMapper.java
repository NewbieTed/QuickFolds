package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.SideEdge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SideEdgeMapper {

    void addByObj(@Param("sideEdge") SideEdge sideEdge);
}
