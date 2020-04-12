package net.irext.server.service.mapper;

import net.irext.server.service.model.CollectKey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * Filename:       CollectKeyMapper.java
 * Revised:        Date: 2020-04-05
 * Revision:       Revision: 1.0
 * <p>
 * Description:    CollectKeyMapper
 * <p>
 * Revision log:
 * 2020-04-05: created by strawmanbobi
 */
@Mapper
@Controller
public interface CollectKeyMapper {
    @Select("SELECT * FROM collect_key WHERE collect_remote_id = #{collectRemoteId}  AND key_id = #{keyNumber}")
    @ResultMap("BaseResultMap")
    List<CollectKey> directDecode(int collectRemoteId, int keyNumber);
}
