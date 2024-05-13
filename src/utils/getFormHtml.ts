import moment from 'moment'

export const getFormHtml = (htmlString) => {
   
  return `<div id="section1" style="color:#000000" >
        ${htmlString}
          <table cellPadding="0" cellSpacing="0" style="text-align: left; width: 100%; line-heigh:26px; margin: 0 auto; background: #fff;">
               <tr>
                  <td style="border:0.5px solid #cccccc;padding:0.4rem;">
                     <div>
                        I understand that in the event of number of applications being large, commission will adopt
                        Short Listing criteria to restrict the number of candidates to be called for interview to a
                        reasonable number, only from amongst eligible candidates by any or more of the following
                        methods:</br>
                        <ol type="a">
                        <li>On the basis of Desirable Qualification (DQ) or any one or all of the DQs if more than one
                        DQ is prescribed</li>
                        <li>On the basis of higher educational qualifications than the minimum prescribed in the
                        advertisement</li>
                        <li>On the basis of higher experience in the relevant field than the minimum prescribed in the
                        advertisement</li>
                        <li>By counting experience before or after the acquisition of essential qualifications</li>
                        <li>By invoking experience even in cases where there is no experience mentioned either</li>
                        <li>By holding a Recruitment Test</li>
                        </ol>
                        <div style="margin-top: 10px;"> I also understand that if at any subsequent stage or at the time
                           of interview any inofrmation given by the me or any claim made by me in my online
                           application(s) is found to be
                           false, my candidature will be liable to be rejected and I may also be debarred either
                           permanently or for a specified period by the :-</br>
                           <ol type="a">
                           <li>Commission from any examination or selection held by them.</li>
                           <li>Central Government from any employment under them.</li>
                           </ol>
                        </div>
                        <div style="margin-top: 10px;"> I hereby declare that all the statements made in the application
                           are true and complete to the best of my knowledge and belief.I understand that action can be
                           taken against me by
                           the Commission if Iam declared by them to be guilty of any type for misconduct mentioned
                           herein. I have informed my Head Office/Deptt. in writing that I am applying for this
                           selection.
                        </div>
                        <div style="margin-top: 20px;font-size: larger;"> Date: ${moment().format(
                          'DD/MM/YYYY',
                        )}</div>
                     </div>
                  </td>
               <tr>
                  <td
                     style="border:0.5px solid #cccccc;padding:0.4rem;font-size: 22px;text-align: center;">
                     ACTION AGAINST CANDIDATED GROUND GUILTY OF MISCONDUCT :
                  </td>
               </tr>
               <tr>
                  <td style="border:0.5px solid #cccccc;padding:0.4rem;">
                     Candidates are warned that they should not furnish any particulars that are false or suppress any
                     material information in filling up the application form. Candidates are also
                     warned that they should in no case correct or alter or otherwise tampered with any entry in a
                     document or its attested/certified copy submitted by them nor should they submit
                     a tampered/fabricated document. If there is any inaccuracy or any discrepancy between two or more
                     such documents or their attested/certified copies, an explanation
                     regarding this discrepancy should be submitted.
                  </td>
               </tr>
               <tr>
                  <td
                     style="border:0.5px solid #cccccc;padding:0.4rem;font-size: 19px;text-align: center;">
                     A candidate who is or has been declared by the Commission to be guilty of :
                  </td>
               </tr>
               <tr>
               <tr>
                  <td style="border:0.5px solid #cccccc;padding:0.4rem;">
                     <ul>
                        <li>
                           Obtaining support of his/her candidature by any means, or
                        </li>
                        <li> Impersonating, or</li>
                        <li>
                           procuring impersonation by any person , or
                        </li>
                        <li>
                           submitting fabricated documents or documents which have been tampered with, or
                        </li>
                        <li>
                           Making statements which are incorrect or false or suppressing material information, or
                        </li>
                        <li>
                           Resorting to any other irregular or improper means in connection with his/her candidature
                           for the selection, or
                        </li>
                        <li>
                           Using unfair means during the test, or
                        </li>
                        <li>
                           Writing irrelevant matter including obscene language or pornographic matter, in the
                           script(s) , or
                        </li>
                        <li>
                           Misbehaving in any other manner in the examination hall, or
                        </li>
                        <li>
                           Harassing or doing bodily harm to the staff employed by the Commission for the conduct of
                           their test, or
                        </li>
                        <li>
                           Bringing mobile phone/Communication device in the examination Hall/Interview room.
                        </li>
                        <li>
                           Attempting to commit or, as the case may be, abetting the Commission of all or any of the
                           acts specified in the foregoing clauses may, in addition to rendering
                           himself/herself liable to criminal persecution, be liable:</br>
                           <ol type="a">
                           <li>to be disqualified by the Commission from selection for which he/she is a candidate,
                           and/or</li>

                           <li>to be debarred either permanently or for a specified period:-
                           
                           <ul style="list-style-type:circle;">
                              <li> by the Commission from any examination or selection held by them</li>
                              <li> by the Central Government from any employment under them, and</li>
                           </ul>
                           </li>
                           <li>if he/she is already in service under Government to disciplinary action under the
                           appropriate rules.</li>
                           </ol>
                        </li>
                     </ul>
                  </td>
               </tr>
               <tr>
                  <td style="border:0.5px solid #cccccc;padding:0.4rem;">
                     Candidates are not required to submit to the Commission by post/hand either the Printout of online
                     Application or any other Documents/ Certificates at this stage. However,
                     candidate must send such documents as and when demanded by the Commission strictly within the
                     stipulated timeframe, failing which their candidature may be rejected.
                  </td>
               </tr>
            </table>
       </div>`
}
