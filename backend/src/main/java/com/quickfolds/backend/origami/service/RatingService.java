package com.quickfolds.backend.origami.service;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.origami.mapper.RatingHistoryMapper;
import com.quickfolds.backend.origami.model.database.RatingHistory;
import com.quickfolds.backend.origami.model.dto.request.RatingRequest;
import com.quickfolds.backend.origami.model.dto.response.RatingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingHistoryMapper ratingHistoryMapper;


    public ResponseEntity<BaseResponse<RatingResponse>> rate(RatingRequest request) {
        // Get request fields
        long userId = request.getUserId();
        long origamiId = request.getOrigamiId();
        double rating = request.getRating();

        RatingHistory ratingHistory = ratingHistoryMapper.getObjByUserIdOrigamiId(userId, origamiId);

        Double oldRating = null;

        if (ratingHistory == null) {
            ratingHistory = new RatingHistory();
            ratingHistory.setUserId(userId);
            ratingHistory.setOrigamiId(origamiId);
        } else {
            oldRating = ratingHistory.getRating();
        }

        ratingHistory.setRating(rating);

        // TODO: Update the rating


        return BaseResponse.success(new RatingResponse(oldRating));
    }


}
