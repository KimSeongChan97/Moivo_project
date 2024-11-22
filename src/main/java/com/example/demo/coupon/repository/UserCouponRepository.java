package com.example.demo.coupon.repository;

import com.example.demo.coupon.entity.UserCouponEntity;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;


@Repository
public interface UserCouponRepository extends JpaRepository<UserCouponEntity, Long> {
  List<UserCouponEntity> findByUserEntity_Id(int id);

}
