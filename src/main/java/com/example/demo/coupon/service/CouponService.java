package com.example.demo.coupon.service;


import java.util.List;

import com.example.demo.coupon.dto.CouponDTO;

public interface CouponService {
    public List<CouponDTO> getUserCoupons(int id);
}
