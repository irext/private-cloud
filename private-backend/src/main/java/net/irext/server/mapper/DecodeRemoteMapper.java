package net.irext.server.mapper;

import net.irext.server.model.DecodeRemote;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * Filename:       DecodeRemoteMapper.java
 * Revised:        Date: 2020-04-05
 * Revision:       Revision: 1.0
 * <p>
 * Description:    DecodeRemoteMapper
 * <p>
 * Revision log:
 * 2020-04-05: created by strawmanbobi
 */
@Mapper
@Controller
public interface DecodeRemoteMapper {
    @Select("SELECT * FROM decode_remote WHERE remote_index_id = #{remoteIndexId}  AND key_number = #{keyNumber}")
    @ResultMap("BaseResultMap")
    List<DecodeRemote> directDecode(int remoteIndexId, int keyNumber);
}
