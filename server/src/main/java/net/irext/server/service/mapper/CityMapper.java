package net.irext.server.service.mapper;

import net.irext.server.service.model.City;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * Filename:       CityMapper.java
 * Revised:        Date: 2019-06-21
 * Revision:       Revision: 1.0
 * <p>
 * Description:    CityMapper
 * <p>
 * Revision log:
 * 2019-06-21: created by strawmanbobi
 */
@Mapper
@Controller
public interface CityMapper {
    @Select("SELECT * FROM city WHERE code LIKE '__0000'")
    @ResultMap("BaseResultMap")
    List<City> listProvinces();

    @Select("SELECT * FROM city WHERE code LIKE #{provincePrefix} AND code NOT LIKE '__0000'")
    @ResultMap("BaseResultMap")
    List<City> listCities(String provincePrefix);
}
