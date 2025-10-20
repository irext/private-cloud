/*
 * Created by Strawmanbobi
 * 2014-08-30
 */

function objectMemberCount(conditions) {
    let memberCount = 0;
    for(let f in conditions) {
        memberCount++;
    }
    let whereClause = "";
           let index = 0;
           for(let field in conditions) {
               whereClause += field + " = '" + conditions[field] + "'";
               if(index < memberCount - 1) {
                   whereClause += " AND ";
               }
           }
           return  whereClause;
}

module.exports = objectMemberCount;