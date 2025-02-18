package com.quickfolds.backend.origami.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrigamiListResponse {

    List<OrigamiResponse> origamis;
}
