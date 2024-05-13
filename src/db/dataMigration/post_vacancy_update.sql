/*New Post ID ==>YYMMDD<section[1]><serial[2]> 
ORA =>section=>1 to 7,serial =>as serial no in 2 digit
SOAP =>section=>0 ,serial =>as examid 2 digit
 */
update posts set old_post_id=post_id;
update posts set post_id=concat(substr(vacancy_no,1,2),substr(vacancy_no,3,2),substr(vacancy_no,10,2),substr(vacancy_no,9,1),substr(vacancy_no,7,2))::int
update post_modules_data set post_id=(select posts.post_id from posts where post_modules_data.post_id=posts.old_post_id)