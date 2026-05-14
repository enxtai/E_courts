
console.clear();
if (!$.isArray) {
  $.isArray = Array.isArray;
}

if (!$.trim) {
  $.trim = function (str) {
    return (str || "").trim();
  };
}

$(document).ready(function() {

	$('#captcha').bind('input', function() {
  var c = this.selectionStart,
      r = /[^0-9 a-z A-Z.]/gi,
      v = $(this).val();
  if(r.test(v)) {
    $(this).val(v.replace(r, ''));
    c--;
  }
  this.setSelectionRange(c, c);
});
	$('#judge_txt').bind('input', function() {
  var c = this.selectionStart,
      r = /[^0-9  a-z A-Z () *`{}'.]/gi,
      v = $(this).val();
  if(r.test(v)) {
    $(this).val(v.replace(r, ''));
    c--;
  }
  this.setSelectionRange(c, c);
});



$('#case_no').bind('input', function() {
  var c = this.selectionStart,
      r = /[^0-9]/gi,
      v = $(this).val();
  if(r.test(v)) {
    $(this).val(v.replace(r, ''));
    c--;
  }
  this.setSelectionRange(c, c);
});

$('#case_year').bind('input', function() {
  var c = this.selectionStart,
      r = /[^0-9]/gi,
      v = $(this).val();
  if(r.test(v)) {
    $(this).val(v.replace(r, ''));
    c--;
  }
  this.setSelectionRange(c, c);
});

$('#pet_res').bind('input', function() {
  var c = this.selectionStart,
      r = /[^0-9  a-z A-Z () *`{}'.]/gi,
      v = $(this).val();
  if(r.test(v)) {
    $(this).val(v.replace(r, ''));
    c--;
  }
  this.setSelectionRange(c, c);
});

$('#act_txt').bind('input', function() {
  var c = this.selectionStart,
      r = /[^0-9  a-z A-Z () *`{}'.]/gi,
      v = $(this).val();
  if(r.test(v)) {
    $(this).val(v.replace(r, ''));
    c--;
  }
  this.setSelectionRange(c, c);
});
$('#section_txt').bind('input', function() {
  var c = this.selectionStart,
      r = /[^0-9  a-z A-Z () *`{}'.]/gi,
      v = $(this).val();
  if(r.test(v)) {
    $(this).val(v.replace(r, ''));
    c--;
  }
  this.setSelectionRange(c, c);
});

$('#citation_year').bind('input', function() {
  var c = this.selectionStart,
      r = /[^0-9 ]/gi,
      v = $(this).val();
  if(r.test(v)) {
    $(this).val(v.replace(r, ''));
    c--;
  }
  this.setSelectionRange(c, c);
});

$('#citation_vol').bind('input', function() {
  var c = this.selectionStart,
      r = /[^0-9 ]/gi,
      v = $(this).val();
  if(r.test(v)) {
    $(this).val(v.replace(r, ''));
    c--;
  }
  this.setSelectionRange(c, c);
});

$('#citation_supl').bind('input', function() {
  var c = this.selectionStart,
      r = /[^0-9 ]/gi,
      v = $(this).val();
  if(r.test(v)) {
    $(this).val(v.replace(r, ''));
    c--;
  }
  this.setSelectionRange(c, c);
});

$('#citation_page').bind('input', function() {
  var c = this.selectionStart,
      r = /[^0-9 ]/gi,
      v = $(this).val();
  if(r.test(v)) {
    $(this).val(v.replace(r, ''));
    c--;
  }
  this.setSelectionRange(c, c);
});

$('#search_text').bind('input', function() {
  var c = this.selectionStart,
      r = /[^0-9  a-z A-Z () *`{}@.&]/gi,
      v = $(this).val();
  if(r.test(v)) {
    $(this).val(v.replace(r, ''));
    c--;
  }
  this.setSelectionRange(c, c);
});

$(document).on('click',function(){
		setTimeout(function(){$('label.error').hide()},5000);
});
	//location.reload(true);

	/*$('#dropdownMenuButton1').on('click', function (event) {
		$(this).toggleClass('show');
		 $('.mtpdropdown-menu.dropdown-menu').toggleClass('show');
	});
		$('#dropdownMenuButton2').on('click', function (event) {
		$(this).toggleClass('show');
		 $('.dropdown-menudrp.dropdown-menu').toggleClass('show');
	}); */

	$('#fcourt_type').on('change', function () {
     var selectVal = $("#fcourt_type option:selected").val();
                       //alert(selectVal);
         if(selectVal!=3)
        { $("#sel_lang").hide();
                $("#sel_lang").val('');

        }
	else
	{
		$("#sel_lang").show();
	}

});

	 $('input[type=radio][name=searchOptions]').click(function () {
        var search_opt=$(this).val();
        if(search_opt=='ALL')
        {
                $("#sel_prox").show();
                $("#div_prox").show();
        }
        else
        {
                $("#sel_prox").hide();
                $("#div_prox").hide();
        }

    });


	$(".sidebarULBtn").on('click', function() {
		$(".sidebarULBtn").removeClass("active");
		$( this ).addClass("active");
	});

    $("#smallSidebar").on('click', function() {
		$(".sidebarULBtn").removeClass("collapsing");
        $("#mainContainer").toggleClass("sidebar-collapsed");
		
		var flg='N';
		if($('#mainContainer').hasClass('sidebar-collapsed'))
		{
			flg='Y';
			$('.collapse').removeClass('show');
		}
		else
		{
			var level1=$('#level1').val();
			$('#level1_'+level1).click();
		}
		

		var url="home/setMenu/"+flg;
		var postdata='';
		ajaxCall({url:url,postdata:postdata,callback:callback,loader:false});
		function callback(result)
		{
			
		}
    });

	
  $.ajaxSetup({ cache: true });
  //$('select').chosen({'width':'100%'});
  $.validator.setDefaults({ ignore: ":hidden:not(select)" });



/*$('#search_text').keydown(function () {
	
	var url="pdf_search/get_search_data";
	var text=$("#search_text").val();
	var post_data='text='+text;
	//alert(post_data)
	ajaxCall({url:url,postdata:post_data,callback:callbk,loader:false});
	
	function callbk(result)
	{
		*/
		var searchres=["element","embezzlement","embezzler","emolument","encroach","enjoin","entry of judgment","equal protection of the law","equitable estoppel","equitable lien","equity","equity of redemption","ergo","errors and omissions","estop","et al.","et seq.","evasion of tax","executive clemency","executive order","executive privilege","executor","exhibit","expert witness","extension","extortion","extrinsic fraud","face value","failure of issue","false imprisonment","fighting words","file","firm offer","forced sale","foreclosure sale","forensic medicine","franchise","freehold","full disclosure","gag order","garnishee","general partner","generation skipping","go bail","goods","grantor","habitable","harass","harmless error","headnote","hearing","hereditament","hidden asset","on file","on or about","on or before","opinion","order to show cause","ordinary course of business","out of court","outlaw","owe","ownership","paid into court","paper hanger","paralegal","parental neglect","partial disability","participate","partner","partnership","party of the first part","passion","pay","peculation","pecuniary","pedophilia","peeping tom","peer","penal","peremptory writ of mandate","perfect","perjury","permanent injunction","personal effects","pimp","piracy","pledge","police court","police powers","power","preferred stock","prescriptive easement","pretermitted heir","prima facie","primogeniture","prior(s)","pro se","probate","probation","probative value","product liability","professional corporation","proffer","promissory estoppel","proof","abortion","abstract of judgment","abuse of process","acceleration","acceleration clause","accept","access","acknowledge","acknowledgment","act","actual notice","ad valorem","adjusted basis","admission to bail","advancement","adverse witness","affirmative action","after-acquired property","agent","aggravated assault","alibi","alienation of affections","aliquot","alternative pleading","amended complaint","amended pleading","amnesty","annuity","anticipatory breach","antitrust laws","appeal","approach the bench","approach the witness","appurtenant","arbitrator","asset","association","attorney","attorney's fee","bail","bail bondsman","bailiff","barrister","bearer paper","bench","bias","holder in due course","holdover tenancy","hometowned","homicide","house counsel","implied covenant of good faith and fair dealing","implied warranty","impotence","impound","in forma pauperis","in haec verba","in personam","in propria persona","in re","inchoate","income tax","incompetent evidence","incorporation","incriminate","independent contractor","indicia","indigent","indorsement","inheritance","injury","insider trading","instrument","inter se","inter vivos","blank endorsement","board of directors","boilerplate","bond","bondsman","bottomry","boycott","breach of warranty","caning","capital assets","capital gains","carrier","carryback","case system","certificate of deposit (cd)","certified check","cestui que use","chambers","chancery","charity","chattel","child custody","civil calendar","civil code","civil liberties","civil rights","claim against a governmental agency","close corporation","closing","closing argument","cloud on title (cloud)","collateral descendant","collusive action","commercial frustration","commercial law","common law","comparative negligence","condominium","condone","confession","confiscate","confrontation","consequential damages","conservatee","conservator","constitutional rights","constructive trust","construe","consumer protection laws","contingency","continuing trespass","defraud","deliberation","denial","dependent","depletion","depreciate","derivative action","devolve","dicta","direct evidence","disclaimer","discretion","dishonor","disinherit","disorderly conduct","disposition","dissent","distinguish","disturbing the peace","divestment","docket","document","dower","draw","driving under the influence (dui)","duty","duty of care","prosecution","prospectus","protest","provisional remedy","public charge","publication","punitive damages","quasi contract","question of fact","quit","ratable","ready, willing and able","rebuttal","reckless disregard","record","recoupment","recourse","redeem","reentry","registry of deeds","relevant","reliction","remise","interlineation","international law","intervene","invasion of privacy","inverse condemnation","invest","issue","jeopardy","jobber","joinder","joint and several","joint liability","joint tenancy","judge","judge advocate general","judicial proceedings","k","kidnapping","landlord","law and motion calendar","law book","legal age","legal fiction","convict","corporate opportunity","corroborating evidence","cotenancy","counsel","count","creditor","crime against nature","culpability","culpable","cumulative voting","dangerous","de jure","de novo","death row","declaratory relief","dedication","defalcation","defamation","legal services","legatee","legitimate","letters","lewd and lascivious","licensee","licensor","limited liability","magna carta","maim","make","malice","malice aforethought","malicious prosecution","malpractice","mandate","manifest","marital deduction","marital rights","maritime law","market value","marshal","mayhem","mediation","memorandum","mens rea","mental anguish","mental cruelty","mesne profits","military law","minority","misdemeanor","misjoinder","modification","moiety","monument","moot point","mortgage","motion for a summary judgment","motion to strike","mouthpiece","municipal court","n.o.v.","negative declaration","negligence per se","next of kin","nil","no fault divorce","non-conforming use","non-feasance","non-suit","not guilty","note","nugatory","nuisance","occupant","occupation","occupational disease","off calendar","official misconduct","omnibus clause","remote","removal","renewal","rent","representation","repudiation","res","res adjudicata","res gestae","reserve","resolution","respondent","restraining order","restrictive endorsement","result","retire","retrial","return of service","risk","risk of loss","rule","running at large","said","scope of employment","sedition","seized","self-defense","senior lien","seriatim","services","settlor","several liability","sexual harassment","shall","short cause","slander","stakeholder","standing","state of domicile","statute of limitations","statutory offer of settlement","street","submitted","subpena duces tecum","substantive law","substitution of attorney","sum certain","summary judgment","supersedeas","syndicate","tainted evidence","tax return","temporary injunction","temporary insanity","testacy","testator","testify","three-day notice","title insurance","tortious","trade","transcript","transfer","trial de novo","trustor","turn states' evidence","unconstitutional","underwriter","unfair competition","unissued stock","uxor","valuable consideration","vendee","vest","vested remainder","vexatious litigation","voir dire","waiver","wanton","ward","willfully","witness","words of art","writ of attachment","writ of coram nobis","wrongful death","wrongful termination","your honor","youthful offenders","zoning","eleemosynary","employment","en banc","enter a judgment","entity","equal opportunity","esquire","evidence","ex parte","excessive bail","exchange","excise","exculpatory","executed","execution","executory interest","executrix","express","extenuating circumstances","extinguishment","extradition","extrajudicial","false arrest","felony murder doctrine","finding","flight","fob","foreclosure","forensic","foreseeability","forfeit","forum","foster child","fruit of the poisonous tree","general plan","gift","good title","governmental immunity","grand larceny","grant deed","gratuitous","guaranty","guardian","guardian ad litem","guest","heiress","highway","hobby loss","hold harmless","abandon","abate","abatement","abduction","abeyance","abuse of discretion","accessory","accomplice","accord and satisfaction","account stated","acquit","adjudication","administer","administrative law judge","admission against interest","advance","adverse party","affidavit","affirm","after-discovered evidence","age of consent","agreed statement","agreement","aleatory","alias","allege","ambiguity","answer","appellant","appellate court","appellee","approach","arbiter","arrest warrant","articles of impeachment","assault and battery","assignee","attorney's work product","bachelor of laws","bailment","bank","bargain","barratry","basis","battery","bearer","beneficiary","bequeath","best evidence rule","bifurcation","bigamy","bill of lading","controlled substance","controversy","cooperative","coroner","corpus","corpus delicti","corpus juris","cost bill","counsellor","counterpart","court docket","covenant that runs with the land","credible witness","crime","criminal law","cross-complaint","cruel and unusual punishment","cumulative sentence","curtesy","d.b.a.","de jure corporation","debenture","decedent","deceit","declarant","decree","deed","defective title","degree of kinship","deleterious","demand note","demurrer","descent","desert","discovery","disorderly house","dispossess","distress","distribute","distribution","divorce","donation","dowry","draft","drop dead date","due care","due process of law","hornbook law","hostile witness","impaneling","implied contract","in absentia","in extremis","in fee simple","in pari delicto","in pro per","in terrorem clause","incest","income","incompetency","incontrovertible evidence","incumbrance","indenture","indispensable party","infancy","infra","ingress","injunction","innocent","innuendo","insolvency","inspection of documents","insurance","intent","interlocutory","intrinsic fraud","irreconcilable differences","irreparable damage or injury","j","jd","joint venture","judgment creditor","judicial sale","jurisdiction","jurisprudence","jury box","jury stress","just compensation","justice of the peace","justiciable","kin","labor and materials","land","landlord and tenant","latent defect","law of the case","leading question","leading the witness","legal aid society","proprietor","prosecutor","prove","public figure","public property","public trust doctrine","public use","publish","quantum meruit","quiet title action","quitclaim deed","quorum","quotient verdict","race to the courthouse","ratification","reasonable reliance","reasonable speed","rebate","recidivist","reciprocal discovery","recover","rehearing","release","release on one's own recognizance","reliance","class action","collateral attack","color of title","commencement of action","comment","common carrier","complainant","compounding a felony","conclusion of fact","condition precedent","confess","confession and avoidance","conscientious objector","consideration","constructive","constructive fraud","constructive notice","contempt of court","contiguous","contingent fee","moral turpitude","moratorium","motive","municipal","muniment of title","mutual","mutual wills","nolle prosequi","nominal party","non-contestability clause","non-contiguous","non-profit corporation","notice","notice to quit","o.s.c.","oath","obscene","occupy the field","offender","offer of proof","officer","officious intermeddler","book account","brief","broker","bucket shop","bulk sale","burden of proof","burglary","business","capital offense","caption","careless","carryover","casual","cease and desist order","chain of title","change of circumstances","charter","child support","cite","citizen","civil","civil law","civil liability","lessee","lesser-included offense","letter of credit","letters of administration","letters testamentary","liability","libel per se","liquidate","lis pendens","literary property","majority","maker","malfeasance","mandatory joinder","marketable title","marriage","material","may","meet and confer","misprision of a felony","on the stand","opening statement","operation of law","original jurisdiction","ostensible agent","out-of-pocket expenses","own recognizance","palimony","parish","parody","parol","partial","partial verdict","party","party of the second part","passenger","patent ambiguity","patent infringement","pawn","payable","peer review","per capita","per diem","per stirpes","perjurer","pierce the corporate veil","pink slip","plaintiff","plea bargain","pleading","political question","polygamy","pornography","posse comitatus","possibility of a reverter","post","post mortem","practice","prayer","preferred dividend","preliminary injunction","premeditation","premises","prescription","presentment","price fixing","private parts","private road","privilege","privileged communication","privity","pro bono","pro forma","pro tanto","pro tem","pro tempore","procedure","prohibition","property damage","renunciation","reply brief","reprieve","reputation","reputed","requirements contract","residence","residue","resisting arrest","restatement of the law","restraint of trade","retainer","rules of court","salvage","scintilla","sealed verdict","sealing of records","secondary boycott","secret rebate","seizure","self-dealing","separation","separation agreement","session","set","settlement","sharp practice","sheriff","shield laws","similarly situated","special circumstances","specific legacy","spendthrift clause","stock certificate","stockholder","stop and frisk","sua sponte","subcontractor","subject to","subscribe","substantial performance","substituted service","successive sentences","sui generis","suit","summary adjudication of issues","superseding cause","surety","surrender","surrogate","tax evasion","tenancy at will","tenant","tentative trust","thirty-day notice","time served","timely","title","title report","trade name","transfer in contemplation of death","ultrahazardous activity","undisclosed principal","undivided interest","undue influence","verification","watered stock","widower","will contest","winding up","wiretap","witness stand","writ of execution","claim in bankruptcy","class","clean hands doctrine","clear title","code of professional responsibility","codefendant","codicil","codify","collateral estoppel","collusion","comity","commission","common counts","common property","common-law marriage","commutation","commute a sentence","company","compensation","compromise","concealed weapon","concealment","condition","conditional bequest","confession of judgment","confidence game","confidential communication","conjugal rights","consent","consent decree","conspirator","constructive eviction","constructive possession","contingent remainder","contra","defense attorney","delivery","deportation","depose","derelict","dereliction","devise","devisee","dictum","diligence","directed verdict","disbar","disbarment","discount","discrimination","disinheritance","disjunctive allegations","disposing mind and memory","divestiture","dna","documentary evidence","domestic violence","domicile","dominant estate","donative intent","donee","donor","double taxation","duress","earnest payment","ejectment","ejusdem generis","election under the will","emblements","emergency","employer","encroachment","encumbrance","environmental impact report","equivalent","error","escalator clause","estate","eviction","ex delicto","exception in deed","exclusionary rule","execute","executory","exemplary damages","exemption","expense","expert testimony","face amount","factor","fair comment","fair market value","fee","fee simple","felon","felony","contractor","conversion","conveyance","cop a plea","corroborate","cosign","cotenant","counterfeit","course","court costs","court of appeals","court trial","court-martial","credibility","creditor's claim","criminal","criminal attorney","criminal calendar","criminal justice","cruelty","dangerous weapon","deadly weapon","debtor","deception","declaratory judgment","deed of trust","default judgment","defendant","a priori assumption","ab initio","abandoned property","abrogate","abstract of title","acceptance","accounts payable","accounts receivable","accrue","acquittal","ad seriatim","adeem","ademption","adhesion contract","adverse","advisory opinion","after-acquired title","alien","alimony","alluvion","amend","fictitious defendants","final decree","first impression","forum non conveniens","four corners of an instrument","franchise tax","garnish","gender bias","general appearance","grace period","grand theft","grantor-grantee index","gross income","harassment","hearsay","hearsay rule","heir apparent","interim order","interpleader","ipse dixit","ipso facto","joint adventure","joint custody","joint enterprise","joint powers agreement","judgment by default","judgment debt","jurisdictional amount","jury","jury panel","lapse","larceny","last will and testament","law of admiralty","leasehold","legal action","homestead","illusory promise","immaterial","immediately","immunity","impossibility","in chambers","in lieu","incapacity","indefeasible","information and belief","informed consent","inquest","insanity defense","insider","installment contract","insured","insurer","inter alia","leverage","lie detector test","lienor","life estate","liquidated damages","litigious","loss of bargain","lower court","m. o.","mandamus","mandatory","master","material representation","matter of record","meeting of the minds","mental suffering","merchantable","mistake","apparent authority","appearance","arguendo","article","articles of incorporation","as is","assault","assignment","assignment for benefit of creditors","assumption of risk","assured","attached","attempt","attorney-in-fact","avulsion","award","bad debt","bad faith","bailee","bailor","bait and switch","balance sheet","bar examination","beach bum trust provision","beneficial use","bifurcate","bill of particulars","bona fide purchaser","book value","breach of the peace","building and loan","burden","buy-sell agreement","c.i.f.","cancel","capital account","capital expenditure","capital punishment","capital stock","capitalization","care","case of first impression","caveat emptor","certificate of incorporation","certiorari","chancellor","chattel mortgage","child","claim against an estate","mistrial","mitigating circumstances","month-to-month","moot","moot court","motion","natural person","negligent","net","nisi prius","no contest","no-par stock","nolo contendere","nominee","notary","notice of default","nullity","nunc pro tunc","object","objection","obligor","omission","on all fours","order","ordinary","ostensible authority","overrule","owner","panderer","panel","pardon","parens patriae","pari delicto","parol evidence rule","partial breach","passive","patent","patent defect","patent pending","payable on demand","peace bond","peaceable possession","penalty","per","per se","peremptory challenge","perpetuity","petit jury","petty larceny","physician-patient privilege","pilferage","plea","plenary","possess","possession","possession of stolen goods","postdated check","pray","premium","prima facie case","principal place of business","private property","privilege against self incrimina-tion","pro per","pro rata","probable cause","probative","process server","proctor","promotional stock","prostitution","proxy","public","public defender","public domain","public record","putative","quasi corporation","query","quo warranto","reasonable time","receiver","reckless","recuse","registration statement","remainder","remainderman","repair","replevin","representative","res ipsa loquitur","res judicata","rescission","resident","residuary bequest","resulting trust","retroactive","reversal","reversible error","revocation","revoke","rider","riot","roadside test","royalty","sanction","save harmless","scienter","seal","search","search and seizure","second degree murder","secured transaction","seduction","self-incrimination","sentence","sequester","sequestration","service by mail","setoff","sex offender","share","show cause order","situs","sole proprietorship","solicitation","solicitor","solitary confinement","special damages","special master","special verdict","spontaneous exclamation","state","stay","stay away order","stay of execution","strict construction","strike","subordination","subpena","subrogation","subrogee","substitution","suffering","summation","suppression of evidence","supra","surplusage","surrebutal","survivor","survivorship","sustain","take","tenancy in common","tenement","tenure","testamentary capacity","testimony","theft","third party","to wit","tools of trade","tort act","tortfeasor","trade fixture","trademark","treason","treaty","trial","tribunal","trier of fact","trust","trust deed","ultimate fact","unclean hands","uniform commercial code","unlawful","unlawful assembly","usury","variance","voting trust","warranty","warranty deed","whiplash","work product","writ","closed shop","code","cohabitation","coinsurance","commingling","common area","common stock","community property","compensatory damages","compos mentis","compound interest","compound question","condemn","condemnation action","conditional sale","confusingly similar","conscious parallelism","consign","consignee","consignment","consortium","conspiracy","contingent","contingent beneficiary","contingent interest","continuance","continuing objection","contract","contributory negligence","copartner","cost of completion","costs","counter offer","court calendar","covenant","covenant not to compete","creditor's rights","cross-examination","cruelty to animals","custody","cy pres doctrine","damages","date rape","de minimis","death penalty","debt","decide","declaration of mailing","declaration of trust","default","defective","a fortiori","abandonment","able-bodied","abscond","abstract","acceptance of service","accusation","actionable","ad hoc","administrator","admiralty","admission of evidence","admission of guilt","adultery","adverse interest","affiant","age discrimination","agency","alienation","all the estate i own","allegation","alter ego","american depository receipt","amortization","and","antenuptial (prenuptial) agreement","appraise","appraiser","appreciate","arbitrary","arrears","arson","attachment","attest","attorney general","attorney-client privilege","attorney's advertising","authorize","back-to-back life sentences","bankruptcy proceedings","beneficial interest","benefit of counsel","bilateral contract","or","ouster","output contract","overcharge","overt act","own","par","paramount title","parcel","parent","penitentiary","peremptory","perfected","person","personal property","personal service","personalty","petitioner","plagiarism","plain view doctrine","plead","possessory interest","pot","power of acceptance","power of appointment","power of attorney","predecease","preemptive right","prerogative writ","presiding judge","pretrial discovery","prevailing party","prior restraint","priority","privacy","private carrier","private nuisance","probative facts","proceeding","proper party","property","proprietary","proprietary interest","interlocutory decree","interrogatories","interstate commerce","intervention","intestacy","intestate","intoxication","inure","judgment","judgment debtor","judgment notwithstanding the verdict","judicial discretion","jump bail","jurat","jurist","jury fees","jury selection","jury trial","justice","kangaroo court","last antecedent rule","law","lawsuit","leading","legal advertising","legal duty","legal separation","defense","delinquent","demand","demise","deponent","deposition","depreciation reserve","descent and distribution","desertion","determinable","direct and proximate cause","director","dismiss","dismissal","dissolution","dissolution of corporation","dividend","doing business","domestic relations","dominant tenement","double jeopardy","drawer","dying declaration","election of remedies","binder","booby trap","breach","breach of trust","breaking and entering","but for rule","bylaws","calumny","cancellation","canon law","carnal knowledge","carrying for hire","carrying on business","case","cashier's check","cause","cause of action","cestui que trust","charge","check","chief justice","churning","circumstantial evidence","citation","civil action","claim","protective custody","public corporation","puffing","quash","quasi-judicial","question of law","quid pro quo","quiet enjoyment","rape","ratify","rational basis","real estate","real estate investment trust","real party in interest","real property","reasonable","rebuttable presumption","receivership","reciprocity","reckless driving","recusal","refresh one's memory","register","relief","mitigation of damages","moral certainty","mortgagee","motion for a new trial","motion to suppress","movant","move","multifarious","murder","negative pregnant","new matter","next friend","nominal damages","non sequitur","novation","obiter dicta","occupancy","occupational hazard","of counsel","offense","offer","offeree","offeror","official","offset","holding","holding company","hostile possession","hotchpot","hung jury","hypothecate","I.e.","illegal immigrant","impeach","improvement","impute","incompatible","incorporate by reference","indecent exposure","indictable offense","information","injunctive relief","insanity","insertion","instruction","legal tender","legalese","lesser crime","levy","liable","libel","liberty","life without possibility of parole","limitation of actions","living trust","locus","loiter","malum in se","manslaughter","master and servant","maxims","mechanic's lien","mental competency","merger","minor","emancipation","employee","enabling clause","endorse (indorse)","endorsement","entrapment","environmental law","erroneous","escape clause","escheat","escrow","escrow instructions","espionage","estoppel","ex post facto","examination","excusable neglect","express contract","eyewitness","fact","failure of consideration","false pretenses","felonious","fiduciary","fiduciary relationship","final judgment","floating easement","for value received","forcible entry","forensics","foreseeable risk","forger","fornication","forthwith","fraud","free and clear","free on board (fob)","friendly suit","frisk","frivolous","future interest","general counsel","general damages","gift in contemplation of death","gift tax","grand jury","grant","gravamen","guarantee","guilty","habeas corpus","half blood","head of household","heir","heirs of the body","hit and run","holder","reorganization","repossess","reserve fund","respondeat superior","restitution","restraint on alienation","retraction","reversion","review","revival","rights","robbery","rogatory letters","ruling","running with the land","satisfaction","satisfaction of judgment","savings and loan","self-executing","sell","servant","service","service by fax","set aside","setting","settle","severable contract","share and share alike","shareholders' agreement","shareholders' derivative action","shortening time","sidebar","silent partner","sound mind and memory","special","special administrator","specific devise","specific finding","specific performance","stare decisis","statute","statutory rape","stock option","straw man","strict liability","sublease","subpoena","subrogor","succession","suicide","supplemental","supreme court","suspended sentence","swear","tangible property","tax","tax costs","tenancy","tenancy by the entirety","tender","term","testamentary","tide lands","title search","tort","trader","trespass","trust fund","trustee","under the influence","underwrite","unjust enrichment","unreasonable search and seizure","usurious","utter","vendor","venue","vested","vicarious liability","vigilante","viz","voidable","voluntary bankruptcy","waive","wet reckless","widow's election","will","willful","wind up","blackmail","boiler room","bona fide","breach of contract","bribery","brought to trial","bulk transfer","business invitee","calendar","calendar call","call","cap","capital","capitalized value","capricious","cartel","case law","casualty","casualty loss","caveat","certificate of title","champerty","character witness","charitable contribution","charitable remainder trust (charitable remainder irrevocable unitrust)","civil penalties","civil procedure","clear and convincing evidence","clerk","co-trustee","color of law","comaker","commitment","competent","complaint","compromise verdict","conclusion","conclusion of law","concurrent sentences","condemnation","condition subsequent","confidential relation","conflict of interest","consent judgment","construction","contemplation of death","appear","appreciation","arbitration","argumentative","arm's length","arraign","arraignment","arrest","assess","assign","associate justice","assume","assumption","at will employment","attestation","attorney at law (or attorney-at-law)","attorney of record","attractive nuisance doctrine","audit","auditor","authorities","authority","bail bond","balance due","bankruptcy","bar","bar association","belief","bench warrant","benefit","bequest","bfp","bid","bill","bill of exchange","bill of sale","interest","interrogation","intervening cause","intestate succession","investment","invitee","involuntary","irrelevant","joinder of issue","joint tortfeasors","judge advocate","judicial","judicial foreclosure","judicial notice","juror","jury of one's peers","jury tampering","justifiable homicide","juvenile court","juvenile delinquent","laches","landlady","landlocked","landlord's lien","last clear chance","lateral support","law of the land","lay a foundation","lease","legacy","legal","hot pursuit","household","illegal","impanel","impeachment","impleader","implied","implied consent","in camera","in kind","in limine","in loco parentis","in perpetuity","in rem","in toto","incidental beneficiary","incompatibility","incompetent","incorporate","incorporeal","indemnify","indemnity","indeterminate sentence","indictment","inference","infringement","inherit","insufficient evidence","intangible property","inter vivos trust","final settlement","findings of fact","first degree murder","fixture","forbearance","forensic testimony","forfeiture","forgery","fraud in the inducement","fraudulent conveyance","fresh pursuit","frustration of purpose","fugitive from justice","fungible things","garnishment","general denial","good cause","good faith","good samaritan rule","goodwill","grantee","gross negligence","guarantor","habitual criminal","heat of passion","held","contract of adhesion","contribution","control","convey","conviction","cooperative housing","copyright","corporation","counterclaim","course of employment","court","court of law","crime of passion","cumis counsel","cut a check","day in court","de facto","de facto corporation","dealer","deceased","decision","declaration","decriminalization","deduction","defeasance","defect","on the merits","open court","option","oral contract","ordinance","orphan","outbuilding","pain and suffering","pander","parole","partition","party wall","paternity suit","payee","payment in due course","payment in full","payor","pendente lite","per curiam","perform","performance","permanent disability","permanent injury","permissive","permit","personal services","a.k.a.","abet","absolute","abut","accommodation","accretion","action","actual controversy","ad litem","addendum","adequate remedy","adjourn","adjuster","administrative hearing","administrative law","admissible evidence","admission","admit","adopt","adoption","adverse possession","affirmative defense","affix","aid and abet","amicus curiae","eminent domain","emotional distress","enclosure","endowment","enjoyment","equitable","escrow agent","estate by entirety","et ux.","ex officio","exception","expectancy","expropriation","extraordinary fees","extreme cruelty","fact finder (finder of fact)","fair use","family","family purpose doctrine","fee tail","deficiency judgment","deficit","delegate","deliberate","deliver","demonstrative evidence","depreciation","devolution","diminished capacity","diminution in value","direct examination","disability","discharge","discharge in bankruptcy","disfigure","diversion","domestic partners","drawee","due","due and owing","easement","egress","lessor","let","license","lien","limited jurisdiction","limited partnership","lineal descendant","lineup","litigant","living will","long cause","loss","loss of consortium","loss of use","magistrate","mail box rule","make one whole","malum prohibitum","mark","marked for identification","material witness","maturity","mediator","mercantile law","mesne","metes and bounds","mining claim","minutes","mirror wills","misadventure","misappropriation","misfeasance","misnomer","misrepresentation","modus operandi","molestation","monopoly","mortgagor","motion for dismissal","motion in limine","multiplicity of suits","necessary","necessary inference","necessary party","negligence","negotiable instrument","negotiation","net estate","nihil","non compos mentis","non-discretionary trust","not guilty by reason of insanity","notary public","notorious possession","noxious","o.r.","obligation","obligee","obstruction of justice","officer of the court","on demand","petition","picketing","plaintiff's attorney","plea in abatement","polygraph","pour over will","practicable","precatory","precedent","preference","preliminary hearing","prenuptial agreement","presumption","presumption of innocence","prime suspect","principal","process","professional negligence","promise","promissory note","property tax","propria persona","proprietary rights","prosecute","prostitute","proviso","proximate cause","public administrator","public benefit corporation","public easement","public nuisance","public utility","quasi","quasi in rem","quasi-criminal","queen's bench","qui tam action","ransom","realty","reasonable care","reasonable doubt","reasonable wear and tear","receipt","recess","recording acts","records","recoverable","recovery","redemption","referee","referendum","reformation","regulations","rejection of claim","relevancy","remand","remedy","remittitur","rental value","repeal","reports","represent","request","resale","rescind","rescue doctrine","reservation","responsible","restriction","restrictive covenant","reverter","right","right of way","right to privacy","rule against perpetuities","sale","satisfaction of mortgage","scrivener","search warrant","securities","security deposit","security interest","seisin","self-help","self-serving","seller","service by publication","service of process","servient estate","severance","shareholder","shareholders' meeting","shifting the burden of proof","sign","simple trust","simultaneous death act","sine qua non","sodomy","solvency","sounds in","speaking demurrer","special appearance","specific bequest","speculative damages","spousal support","springing interest","standard of care","star chamber proceedings","status conference","statute of frauds","stipulation","stock","stock in trade","stockholders' derivative action","structure","subordination agreement","subornation of perjury","substitute in","summons","surcharge","swindle","t.r.o.","tax sale","tenancy at sufferance","testamentary disposition","testamentary trust","testatrix","third-party beneficiary","time is of the essence","title abstract","toll","tontine","trade secret","transfer agent","transferred intent","trial court","triple net lease","true bill","ultra vires","unconscionable","unilateral contract","uninsured motorist clause","unlawful detainer","use","vacate","vagrancy","vehicular manslaughter","venire","verdict","void","void for vagueness","warrant","waste","weight of evidence","white collar crime","widow","withdrawal","workers' compensation acts","world court","writ of mandate"];

		if($('#sel_lang').val()!='HIN')
		{
		$( "#search_text" ).autocomplete({
			source: searchres,
			
		})
		.data('ui-autocomplete')._renderItem = function( ul, item ) {
			var replaceMask = "<b style=\"color:green;\">$&</b>";
			var text=$("#search_text").val();
			var html = item.label.replace(text, replaceMask);

			return $( "<li></li>" )
			.data( "ui-autocomplete-item", item )
			.append($("<a></a").html(html) )
			.appendTo( ul );
		};
		}
	//}
//});
  
	
	noBack();
	//window.history.back();
	/*document.onmousedown=disableclick;
	status="Right Click is not allowed";
	
    $(document).on("keydown", disableF5);
	*/
	/*var sidebar=localStorage.getItem("sidebar");
	//alert(sidebar+'=='+$( "#accordionSidebar" ).hasClass( "toggled" ))
	if(sidebar=='Y')
		$('#accordionSidebar').addClass('toggled');
	else
		$('#accordionSidebar').removeClass('toggled');*/
	if($('#mainContainer').hasClass('sidebar-collapsed'))
	{
		$(document).on('click',function(){
		$('.collapse').removeClass('show');
	});
	}
	$('.sidebarULBtn').on('click',function(){
		$('.collapse').removeClass('show');
	});
	
	setToken();
	
	if(!$('#mainContainer').hasClass('sidebar-collapsed'))
	{
		var level1=$('#level1').val();
		
		var link_id=$('#link_id').val();
		$('#level1_'+level1).click();
		
		setTimeout(function(){$('#link_'+link_id).css('background-color','#c2defa')},300);
	}
	var pramukhe_lang="english";
	console.log(pramukhe_lang);
	pramukhIME.addLanguage(PramukhIndic,pramukhe_lang); 
	pramukhIME.enable();
	
	$('#captcha').on('focus',function(){
		var pramukhe_lang="english";
		console.log(pramukhe_lang);
		pramukhIME.addLanguage(PramukhIndic,pramukhe_lang); 
		pramukhIME.enable();
	});
	$('#citation_year').on('focus',function(){
		var pramukhe_lang="english";
		console.log(pramukhe_lang);
		pramukhIME.addLanguage(PramukhIndic,pramukhe_lang); 
		pramukhIME.enable();
	});
	$('#citation_vol').on('focus',function(){
		var pramukhe_lang="english";
		console.log(pramukhe_lang);
		pramukhIME.addLanguage(PramukhIndic,pramukhe_lang); 
		pramukhIME.enable();
	});
	$('#citation_supl').on('focus',function(){
		var pramukhe_lang="english";
		console.log(pramukhe_lang);
		pramukhIME.addLanguage(PramukhIndic,pramukhe_lang); 
		pramukhIME.enable();
	});
	
	$('#citation_page').on('focus',function(){
		var pramukhe_lang="english";
		console.log(pramukhe_lang);
		pramukhIME.addLanguage(PramukhIndic,pramukhe_lang); 
		pramukhIME.enable();
	});
	$('#neu_citation_year').on('focus',function(){
		var pramukhe_lang="english";
		console.log(pramukhe_lang);
		pramukhIME.addLanguage(PramukhIndic,pramukhe_lang); 
		pramukhIME.enable();
	});
	$('#neu_no').on('focus',function(){
		var pramukhe_lang="english";
		console.log(pramukhe_lang);
		pramukhIME.addLanguage(PramukhIndic,pramukhe_lang); 
		pramukhIME.enable();
	});
	$('#case_no1').on('focus',function(){
		var pramukhe_lang="english";
		console.log(pramukhe_lang);
		pramukhIME.addLanguage(PramukhIndic,pramukhe_lang); 
		pramukhIME.enable();
	});
	$('#case_year1').on('focus',function(){
		var pramukhe_lang="english";
		console.log(pramukhe_lang);
		pramukhIME.addLanguage(PramukhIndic,pramukhe_lang); 
		pramukhIME.enable();
	});
	
});

function reg_lang(setPramukeLang)
{
	
	if($('#sel_lang').val()=='HIN')
	{
		var pramukhe_lang="hindi";
		console.log(pramukhe_lang);
		pramukhIME.addLanguage(PramukhIndic,pramukhe_lang); 
		pramukhIME.enable();
	}
}

function setTopBar(str)
{
	if(str=='D')
	{
		$("header.navbar").removeClass("bg-topthemeLight").addClass("bg-topthemeDark");
	}
	if(str=='L')
	{
		$("header.navbar").removeClass("bg-topthemeDark").addClass("bg-topthemeLight");
	}
	var url="home/setTop/"+str;
	var postdata='';
	ajaxCall({url:url,postdata:postdata,callback:callback,loader:false});
	function callback(result)
	{
		
	}
}
function setSideBar(str)
{
	if(str=='D')
	{
		$(".sidebarULBtn").removeClass("collapsing");
        $("#mainContainer").removeClass("sidebar-collapsed");
		
		var flg='N';
		if($('#mainContainer').hasClass('sidebar-collapsed'))
			flg='Y';
		var level1=$('#level1').val();
		$('#level1_'+level1).click();
		
	}
	if(str=='C')
	{
		$(".sidebarULBtn").removeClass("collapsing");
        $("#mainContainer").addClass("sidebar-collapsed");
		
		var flg='N';
		if($('#mainContainer').hasClass('sidebar-collapsed'))
			flg='Y';
		$('.collapse').removeClass('show');
	}
	var url="home/setMenu/"+flg;
	var postdata='';
	ajaxCall({url:url,postdata:postdata,callback:callback,loader:false});
	function callback(result)
	{
		
	}
}
function setTheme(str)
{
	if(str=='1')
		$('body').removeClass("bg-theme02").removeClass("bg-theme03").removeClass("bg-theme04");
	else if(str=='2')	
		$('body').removeClass("bg-theme03").removeClass("bg-theme04").addClass("bg-theme02");
	else if(str=='3')	
		$('body').removeClass("bg-theme02").removeClass("bg-theme04").addClass("bg-theme03");
	else if(str=='4')	
		$('body').removeClass("bg-theme02").removeClass("bg-theme03").addClass("bg-theme04");
	var url="home/setTheme/"+str;
	var postdata='';
	ajaxCall({url:url,postdata:postdata,callback:callback,loader:false});
	function callback(result)
	{
		
	}
  
}

function changeLang(lang)
{
	var url="pdf_search/setLanguage/"+lang;
	var postdata='';
	ajaxCall({url:url,postdata:postdata,callback:callback,loader:false});
	function callback(result)
	{
		if(result.lang_status=='Y')
		{
			var app_token=$('#app_token').val();
			var base_url=$('#base_url').val();
			var redirect_path=base_url+"?app_token="+app_token;
			//alert(redirect_path);return false;
			window.location.replace(redirect_path);
		}
	}
}
function openRightMenu() {
	$("#rightMenu").show();
}

function closeRightMenu() {
  $("#rightMenu").hide();
}

function showmodalReport(url)
{
	$('#modal_ifr').modal('show');
	str="<iframe src='"+url+"' style='width:100%; height:90vh;'></iframe>";
	$('#db_title').attr('style','color:#fda006;');
	//alert(result)
	// $('#db_body').load($(this).attr('href'));
	$('#modal_ifr_body').html(str);
}
function setToken()
{
	var app_token=$('#app_token').val();
	//alert('anil'+app_token);
	$('a').on('click',function() {
		//alert('anil'+$(this).attr('href'));
		var href=$(this).attr('href');
		if(app_token!=undefined && href!=undefined)
		{
			if(!$(this).hasClass('noToken'))
				$(this).attr('href','#');
			//alert(href)
			var ques=href.includes('?');
			var token_exists=href.includes('app_token');
			if(!token_exists)
			{
				
				if(!$(this).hasClass('noToken'))
				{
					if(ques)
						href1=href+"&app_token="+app_token;
					else
						href1=href+"?app_token="+app_token;
				}
				
			}
			else
			{
				if(!$(this).hasClass('noToken'))
				{
					a=href.split('app_token');
					href1=a[0]+'app_token='+app_token;
				}
			}
			if(!$(this).hasClass('noToken'))
				$(this).attr('href',href1);
			//alert('role'+$(this).attr('href'));
		}

	});
	$('button').on('click',function() {
		$('a').each(function() {
			//alert('anil'+$(this).attr('href'));
			var href=$(this).attr('href');
			if(app_token!=undefined && href!=undefined)
			{
				if(!$(this).hasClass('noToken'))
					$(this).attr('href','#');
				//alert(href)
				var ques=href.includes('?');
				var token_exists=href.includes('app_token');
				if(!token_exists)
				{
					if(!$(this).hasClass('noToken'))
					{
						if(ques)
							href1=href+"&app_token="+app_token;
						else
							href1=href+"?app_token="+app_token;
					}
					
				}
				else
				{
					if(!$(this).hasClass('noToken'))
					{
						a=href.split('app_token');
						href1=a[0]+'app_token='+app_token;
					}
				}
				if(!$(this).hasClass('noToken'))
					$(this).attr('href',href1);
				//alert('role'+$(this).attr('href'));
			}
		});
	});
}
function requestUri(param)
{
	var app_token=$('#app_token').val();
	var base_url=$('#base_url').val();
	param=param.replace('?','&');
	var redirect_path=base_url+"/?p="+param+"&app_token="+app_token;
	//alert(redirect_path)
	window.location.replace(redirect_path);
}
function noBack() { window.history.forward(); }

function disableclick(e)
{
	if(event.button==2)
	{
		alert(status);
		return false;
	}
}
function disableF5(e) { 
	if ((e.which || e.keyCode) == 116 || (e.which || e.keyCode) == 82) e.preventDefault(); 
};


function ajaxCall(jsonobj)
{
	//alert($('#app_token').val());
	$(".alert-danger").hide();$("#msg-danger").html('');
	$(".alert-success").hide();$("#msg-success").html('');
	var base_url=$('#base_url').val();
	var token=$('#app_token').val();
	var url=jsonobj.url;
	var postdata=jsonobj.postdata;
	var callback=jsonobj.callback;
	var connection=jsonobj.connection;
	var redirect=jsonobj.redirect;
	var result= [];
	if(jsonobj.chosen==false)
		objchosen={chosen:false};
	else if(jsonobj.chosen==true)
		objchosen={chosen:true};
	else if(typeof jsonobj['chosen'] == 'undefined')
		objchosen={chosen:false};
	if(typeof jsonobj['dataType'] == 'undefined')
		jsondataType='json';
	else
		jsondataType=jsonobj.dataType;

	if(typeof jsonobj['loader'] == 'undefined')
		objloader={loader:true};
	else
		objloader=jsonobj.loader;
	
	if(objloader)
		fadein();
	//return false;
	setTimeout(function(){
	var chosen=objchosen.chosen;
	//alert(chosen)
	var estCode = $("#selEstablishment").val();
	//alert(estCode)
	if(estCode!='' && estCode!=undefined)
	{
		var myarr = estCode.split("~");
		var stateCode = myarr[0];
		var distCode = myarr[1];
		var estCode = myarr[2];
	}
	
	if($('#hid_case_adv_pde').val() && $('#hid_case_adv_flag').val()){
		postdata +="&hid_case_adv_pde="+$('#hid_case_adv_pde').val()+"&hid_case_adv_flag="+$('#hid_case_adv_flag').val()
	}
	//alert(token);
	
	
	$.ajax({
		type: "POST",
		url:  base_url+'/?p='+url,
		dataType: jsondataType,
		async: false,
		data:postdata+'&ajax_req='+true+'&app_token='+token,		
		error: function(jqXHR, textStatus, errorThrown) {
			fadeout();//alert(jqXHR.responseText);
			setTimeout(function(){fadeout()},3000);
			setTimeout(function(){fadeout()},5000);
			var responseArray=jqXHR.responseText.split('#####');
			
			//$(".alert-danger").show();
			//$("#msg-danger").html(responseArray[0]);
		   //alert('aaaa'+jqXHR.responseText);
			
			//alert(errorThrown);
			if(redirect=='Y')
			{
				$('#redirect').html(jqXHR.responseText);
			}
		
			$('#submitdata').attr('disabled',false);
			
			
			if(responseArray[1]!='' && responseArray[1]!=undefined)
			{
				//alert(responseArray[1])
				$('#app_token').val(responseArray[1]);
				setToken();
			}
			else
			{
				
				responseArray=jqXHR.responseText.split('"app_token":"');
				if(responseArray[1]!=undefined)
				{
					abc=responseArray[1].split('"}');
					if(abc!=undefined)
					{
						$('#app_token').val(abc[0]);
						setToken();
					}
					
				}
				/*else
				{
					$.ajax({
					type: "POST",
					url:  base_url+'/?p=defaultCls/amrt',
					dataType: jsondataType,
					async: false,
					data:postdata+'&ajax_req='+true+'&app_token='+token,		
					error: function(jqXHR, textStatus, errorThrown) {
					},
					success:function( result ) {
						$('#app_token').val(result.amrt);
						setToken();
					}
					});
				}*/
			}
			if(responseArray[0]!='' && responseArray[0]!=undefined && responseArray[0]!=null && redirect!='Y')
				errorAlert(responseArray[0]);
			/*setTimeout(function(){
				$(".alert-danger").hide();
				$("#msg-danger").html('');
				//$(".alert-dismissible").alert('close');
			},10000);*/
		
			result['status']=false;
			callback(result);
		},
		beforeSend:function()
	   	{	//alert('fadein')
				//if(chosen && url != restricted_url && url != restricted_url1)
	   			
	   	},
		success:function( result ) {
			//result=JSON.parse(result);
			$('#app_token').val(result.app_token);
			setToken();
			//if(url != restricted_url && url != restricted_url1){
			setTimeout(function(){fadeout()},300);
			setTimeout(function(){fadeout()},1000);
			//}
			if(result.session_expire=='Y')
			{
				//$(".alert-danger").show();$("#msg-danger").html(result.errormsg);
				captchaAlert(result.message,result.captcha);
				result['status']=false;
				captcha_image_audioObj.refresh();
				document.getElementById('captcha_image').src = 'vendor/securimage/securimage_show.php? ' + Math.random(); this.blur();
				//callback(result);
				return false;
			}
			if(result.errormsg!='' && result.errormsg!=undefined && result.errormsg!=null)
			{
				//$(".alert-danger").show();$("#msg-danger").html(result.errormsg);
				errorAlert(result.errormsg);
				result['status']=false;
				callback(result);
				return false;
			}
			if(result.msg!='' && result.msg!=undefined && result.msg!=null)
			{
				//alert(result.msg)
				//$(".alert-success").show();
				//$("#msg-success").html(result.msg);
				successAlert(result.msg);
			}
			result['status']=true;
			callback(result);
			
			/*setTimeout(function(){
				$(".alert-danger").hide();
				$("#msg-danger").html('');
				$(".alert-success").hide();
				$("#msg-success").html('');
				//$(".alert-dismissible").alert('close');
			},10000);*/
			
			
			
		}
	
	})},150);
}

function ajaxCallNormal(jsonobj)
{
	
	$(".alert-danger").hide();$("#msg-danger").html('');
	$(".alert-success").hide();$("#msg-success").html('');
	var base_url=$('#base_url').val();
	var token=$('#app_token').val();
	var url=jsonobj.url;
	var postdata=jsonobj.postdata;
	var callback=jsonobj.callback;
	var connection=jsonobj.connection;
	var result= [];
	if(jsonobj.chosen==false)
		objchosen={chosen:false};
	else if(jsonobj.chosen==true)
		objchosen={chosen:true};
	else if(typeof jsonobj['chosen'] == 'undefined')
		objchosen={chosen:false};
	if(typeof jsonobj['dataType'] == 'undefined')
		jsondataType='json';
	else
		jsondataType=jsonobj.dataType;

	if(typeof jsonobj['loader'] == 'undefined')
		objloader={loader:true};
	else
		objloader=jsonobj.loader;
	if(objloader)
		fadein();
	//return false;
	var chosen=objchosen.chosen;
	//alert(chosen)
	var estCode = $("#selEstablishment").val();
	//alert(estCode)
	if(estCode!='' && estCode!=undefined)
	{
		var myarr = estCode.split("~");
		var stateCode = myarr[0];
		var distCode = myarr[1];
		var estCode = myarr[2];
	}
	
	if($('#hid_case_adv_pde').val() && $('#hid_case_adv_flag').val()){
		postdata +="&hid_case_adv_pde="+$('#hid_case_adv_pde').val()+"&hid_case_adv_flag="+$('#hid_case_adv_flag').val()
	}
	
	var restricted_url = 'advocate_case_registration/getActs';
	var restricted_url1 = 'advocate_case_registration/autocomplete_section';
	$.ajax({
		type: "POST",
		url:  base_url+'/?p='+url,
		//dataType: jsondataType,
		async: false,
		data:postdata+'&ajax_req='+true+'&app_token='+token,		
		error: function(jqXHR, textStatus, errorThrown) {
			
			var responseArray=jqXHR.responseText.split('#####');
			//$(".alert-danger").show();
			//$("#msg-danger").html(responseArray[0]);
			if(responseArray[0]!='' && responseArray[0]!=undefined && responseArray[0]!=null)
				errorAlert(responseArray[0]);
			setTimeout(function(){fadeout()},300);
			setTimeout(function(){fadeout()},1000);
			$('#submitdata').attr('disabled',false);
			
			//alert(token)
			if(responseArray[1]!='' && responseArray[1]!=undefined)
			{
				$('#app_token').val(responseArray[1]);
				setToken();
			}
			
			/*setTimeout(function(){
				$(".alert-danger").hide();
				$("#msg-danger").html('');
				//$(".alert-dismissible").alert('close');
			},10000);*/
		
			result['status']=false;
			callback(result);
		},
		beforeSend:function()
	   	{	//alert('fadein')
				//if(chosen && url != restricted_url && url != restricted_url1)
	   			
	   	},
		success:function( result ) {
			//alert('aaa'+result.nsteptoken)
			//alert('out')
			$('#app_token').val(result.app_token);
			setToken();
			//if(url != restricted_url && url != restricted_url1){
			setTimeout(function(){fadeout()},300);
			setTimeout(function(){fadeout()},1000);
			//}
			if(result.errormsg!='' && result.errormsg!=undefined && result.errormsg!=null)
			{
				//$(".alert-danger").show();$("#msg-danger").html(result.errormsg);
				errorAlert(result.errormsg);
				result['status']=false;
				callback(result);
			}
			if(result.msg!='' && result.msg!=undefined && result.msg!=null)
			{
				//alert(result.msg)
				//$(".alert-success").show();
				//$("#msg-success").html(result.msg);
				successAlert(result.msg);
			}
			//result['status']=true;
			callback(result);
						
		}
	
	});
}



function ajaxExternalCall(url,postdata,callback)
{
	$(".alert-danger").hide().html('');
	$(".alert-success").hide().html('');
	
	$.ajax({
		type: "POST",
		url:  url,
		dataType: 'json',
		async: false,
		data:postdata,		
		error: function(jqXHR, textStatus, errorThrown) {
			//alert(jqXHR.responseText)
			//$(".alert-danger").show().html(jqXHR.responseText);
			//$('#submitdata').attr('disabled',false);
			fadeout();
		},
		beforeSend:function()
	   	{		
	   		fadein();
	   	},
		success:function( result ) {
			
			fadeout();
			
			callback(result);
			
		}
	
	});
}

function jsonCall(url,postdata,callback)
{
	$(".alert-danger").hide().html('');
	$(".alert-success").hide().html('');
    var base_url=$('#base_url').val();
    var token=$('#app_token').val();
    //alert(token+'------'+url)
	var url1=base_url+"/?p="+url+'&app_token='+token;
	//var url="jsonFiles/jsondistrict.php";
	fadein();
	$.getJSON(url1,postdata ,function(obj)
   	{
		fadeout();
		if(obj.errormsg!='' && obj.errormsg!=undefined && obj.errormsg!=null)
			$(".alert-danger").show().html(obj.errormsg);
		if(obj.msg!='' && obj.msg!=undefined && obj.msg!=null)
			$(".alert-success").show().html(obj.msg);
		$('#app_token').val(obj.app_token)
		setToken();
		callback(obj);

    }).fail(function(jqXHR, textStatus, errorThrown) {
       //alert(jqXHR.responseText)
       var responseArray=jqXHR.responseText.split('#####');
		$(".alert-danger").show().html(jqXHR.responseText);
		//$('#submitdata').attr('disabled',false);
		fadeout();
		if(responseArray[1]!='' && responseArray[1]!=undefined)
		{
			$('#app_token').val(responseArray[1]);
			setToken();
		}
		
    });


}

function ajaxCallNew(url,postdata,callback,formid)
{
	$(".alert-danger").hide().html('');
	$(".alert-success").hide().html('');
	var base_url=$('#base_url').val();
	var token=$('#app_token').val();//alert('token:'+token);
	postdata.append('ajax_req', true);//alert('postdata:'+postdata);
	postdata.append('app_token', token);
	var result= [];
	fadein();
	$.ajax({
		type: "POST",
		url:  base_url+'/?p='+url,
		dataType: 'json',
		async: "false",
		cache: false,
        contentType: false,
        processData: false,
		data:postdata,		
		error: function(jqXHR, textStatus, errorThrown) {
			
			var responseArray=jqXHR.responseText.split('#####');
			//alert('error:' + jqXHR + ' textStatus:' +textStatus);
			//$(".alert-danger").show();
			//$("#msg-danger").html(responseArray[0]);
			if(responseArray[0]!='' && responseArray[0]!=undefined && responseArray[0]!=null)
				errorAlert(responseArray[0]);
			setTimeout(function(){fadeout()},300);
			setTimeout(function(){fadeout()},1000);
			$('#submitdata').attr('disabled',false);
			
			//alert(token)
			if(responseArray[1]!='' && responseArray[1]!=undefined)
			{
				$('#app_token').val(responseArray[1]);
				setToken();
			}
			
			/*setTimeout(function(){
				$(".alert-danger").hide();
				$("#msg-danger").html('');
				//$(".alert-dismissible").alert('close');
			},10000);*/
		
			result['status']=false;
			callback(result);
		},
		beforeSend:function()
	   	{	//alert('fadein')
				//if(chosen && url != restricted_url && url != restricted_url1)
	   			
	   	},
		success:function( result ) {
			//alert('aaa'+result.nsteptoken)
		
			$('#app_token').val(result.app_token);
			setToken();
			//if(url != restricted_url && url != restricted_url1){
			setTimeout(function(){fadeout()},300);
			setTimeout(function(){fadeout()},1000);
			//}

			//alert('result.errormsg: '+result.errormsg)
			if(result.errormsg!='' && result.errormsg!=undefined && result.errormsg!=null)
			{
				//$(".alert-danger").show();$("#msg-danger").html(result.errormsg);
				errorAlert(result.errormsg);
				result['status']=false;
				callback(result);
			}
			if(result.msg!='' && result.msg!=undefined && result.msg!=null)
			{
				//alert(result.msg)
				//$(".alert-success").show();
				//$("#msg-success").html(result.msg);
				successAlert(result.msg);
			}
			result['status']=true;
			callback(result);
			
			
			
		}
	});
}
function fadein()
{
	//$("form").css("background",'#989898').css("opacity",'0.7');			
	//$(".faded").show();
	var myModal = new bootstrap.Modal($('#loadMe'), {
   backdrop: "static", //remove ability to close modal with click
      keyboard: false, //remove option to close with keyboard
      show: true //Display loader!
})
	myModal.toggle();
	
	
}
function fadeout()
{
	//$("form").show().css("background",'white').css("opacity",'1');
	//$(".faded").hide();
	//alert('aaa');
	$("#loadMe").modal("hide");
	$("#loadMe").removeClass("show");
	$("#loadMe").removeClass("fade");
	$("#loadMe").addClass("hide");
	
	//alert('bbb')

}

function closeModel(obj)
{
	var modal_id=obj.modal_id;
	var clear_data=obj.clear_data_id;
	if(clear_data!='' && clear_data!=undefined)
		$("#"+clear_data).html('');
	
	$("#"+modal_id).modal("hide");
	$("#"+modal_id).removeClass("show");
	$("#"+modal_id).removeClass("fade");
	$("#"+modal_id).addClass("hide");
	$(".xdsoft_datetimepicker").hide();
	$('.popover').popover('hide');
	
}

function get_age(dob) {
    var diff_ms = Date.now() - dob.getTime();
    var age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970);
}

function datePickerIcon(mydate,maxDate1,minDate1)
{
	//alert(mydate);
	var base_url=$('#base_url').val();
	if(minDate1=='' || minDate1==undefined)
		minDate1=new Date('15-08-1947'); 	//minDate1='15-08-1947';

   $('#'+mydate).datepicker({
		
	// defaultDate: new Date(2014, February 2015'), 
	  onClose: function(date, datepicker) {
		  if (datepicker.id == "fpet_dob") {
				if (date != "") {
					var bdate = date.split("-");
					var bday = bdate[0];
					var bmonth = bdate[1];
					var byear = bdate[2];
					var my_age = get_age(new Date(byear, bmonth, bday));
					$('#fextra_age').val(my_age);
				}
		  }

		  if (datepicker.id == "fpet_dob_lh") {
				if (date != "") {
					var bdate = date.split("-");
					var bday = bdate[0];
					var bmonth = bdate[1];
					var byear = bdate[2];
					var my_age = get_age(new Date(byear, bmonth, bday));
					$('#fextra_age_lh').val(my_age);
				}
		  }
                },
	  dateFormat: 'dd-mm-yy',
	  changeMonth: true,
	  changeYear: true,
	  // beforeShowDay: editDays,
	  showOtherMonths: true,
	  selectOtherMonths: true,
	  showOn: "button",
	  buttonImage: base_url+"vendor/jquery-date/images/calendar.gif",
	   buttonImageOnly: true,
	   maxDate: maxDate1,
	  minDate: minDate1,
	  yearRange: "-100:+2",
	}).next('img.ui-datepicker-trigger').attr('tabIndex', "-1");;
}



function compulsaryCheck(str,flag)
{	
	if(flag=='Y')
	{
	
	$('#'+str).rules("add", {
				required: true,  			
				messages    : {
				required    : alerts_array[1],
				}
			});
			setTimeout(function() {$('#'+str).css('background','rgb(229, 247, 254)')}, 300);	
	}
	else if(flag=='N')
	{
	
	
			$('#'+str).rules("add", {
				required: false
			});
			setTimeout(function() {$('#'+str).css('background','white')}, 300);	
			
	}
		
}
function manualCheck(str,msg)
{
	//alert(msg);
	 if(msg=='N')
	{
	
	
			$('#'+str).rules("add", {
				manual_invalid: false,  			
			
			});
			
	}
	else
	{ 
		$('#'+str).rules("add", {
				manual_invalid: true,  			
				messages    : {
				manual_invalid  : msg,
				}
			});
	}
	
		
}

function customizeValidation(str,msg,reg_expr)
{
	
	$('[name="'+str+'"]').rules("add", {
			
			
			cutomize   : true,  
			
			messages    : {	
			
			cutomize    : msg,
		  
			}
	});
		
	
	$.validator.addMethod("cutomize", function( value, element ) {
		var regex = new RegExp(reg_expr);
		var key = value;
		
		if (regex.test(key)) {
		   return true;
		}
		return false;
    });
}
function logOut()
{
	var base_url=$('#base_url').val();
	//alert(''+base_url+'/?p=login/logOut')
	var a=confirm('Are you sure you want to logout?')
    if(a)
	{
		var app_token=$('#app_token').val();
		window.location.href=''+base_url+'/?p=login/logOut&app_token='+app_token;
	}
}

function sideBarToggle()
{
	$('#accordionSidebar').toggleClass('toggled');
	if($( "#accordionSidebar" ).hasClass( "toggled" ))
		localStorage.setItem("sidebar", "Y");
	else
		localStorage.setItem("sidebar", "N");
	$('#appl_logo').toggleClass('appl_logo');
	
}


$.validator.addMethod("accept", function(value, element, param) {
  return value.match(new RegExp("." + param + "$"));
});
$.validator.addMethod("alphanum", function(value, element) {
  return this.optional(element)|| /^\w+$/i.test(value);
});


$.validator.addMethod("EngNotAllowed", function( value, element ) {
        var regex = new RegExp("^[^a-zA-Z]*$");
        var key = value;
		
        if (regex.test(key)) {
           return true;
        }
        return false;
    });

$.validator.addMethod('time', function(value, element, param) {
    return value == '' || value.match(/^([01][0-9]|2[0-3]):[0-5][0-9]$/) || value.match(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/);
}, 'Enter a valid time: hh:mm');

$.validator.addMethod("EngAndSpecialCharNotAllowed", function( value, element ) {
        var regex = new RegExp("^[^a-zA-Z<>\";`%!~#$|+%&*=\[\\]\:^{}?]*$");
        var key = value;
		
        if (regex.test(key)) {
           return true;
        }
        return false;
    });
	$.validator.addMethod("OnlySpecialCharsNotAllowed", function( value, element ) {
        
		// var regex = new RegExp("^[0-9@,-./_]*$");
		var regex = new RegExp("^[^0-9][()@,./\-_:]*$");
        var key = value;
		
        if (regex.test(key)) {
           return false;
        }
		else
		{
        return true;
		}
    });
	$.validator.addMethod("CharCheckForSection", function( value, element ) {
        
		 var regexalpha = new RegExp("^[a-zA-Z0-9,()]+$");
        var keyalpha = value;

        if (regexalpha.test(keyalpha) || keyalpha=='') {
           return true;
        }
        return false;
    });


$.validator.addMethod("specialChars", function( value, element ) {
        var regex = new RegExp("^[^<>\";`%!~#$|+%&*=\[\\]\:^{}?]*$");
        var key = value;
		
        if (regex.test(key)) {
           return true;
        }
        return false;
    });


	


	$.validator.addMethod("nospecialChars", function( value, element ) {
        //var regex = new RegExp("^[^<>'\"/;`%!~#$%&*()=\[\\]\:{}?@.,_-]*$");
        var regex = new RegExp("^[a-zA-Z]+$");
        var key = value;

        if (regex.test(key)) {
           return true;
        }
        return false;
    });
	$.validator.addMethod("urlspecialChars", function( value, element ) {
        var regex = new RegExp("^[^<>'\";`%!~#$%&*()=\[\\]\^{}?@,]*$");
        var key = value;
		
        if (regex.test(key)) {
           return true;
        }
        return false;
    });

	$.validator.addMethod("alphabet", function( value, element ) {
        var regexalpha = new RegExp("^[a-zA-Z0-9()@,. -_/\\n]+$");
        var keyalpha = value;

        if (regexalpha.test(keyalpha) || keyalpha=='') {
           return true;
        }
        return false;
    });

	$.validator.addMethod("emailchar", function( value, element ) {
        var regexalpha = new RegExp("^[a-zA-Z0-9@._-]+$");
        var keyalpha = value;

        if (regexalpha.test(keyalpha) || keyalpha=='') {
           return true;
        }
        return false;
    });

	$.validator.addMethod("alphabetnumber", function( value, element ) {
        var regexalpha = new RegExp("^[a-zA-Z0-9,]+$");
        var keyalpha = value;

        if (regexalpha.test(keyalpha) || keyalpha=='') {
           return true;
        }
        return false;
    });

	$.validator.addMethod("noalphabet", function( value, element ) {
        var regexalpha = new RegExp("^[a-zA-Z]+$");
        var keyalpha = value;

        if (regexalpha.test(keyalpha) && keyalpha!='') {
           return false;
        }
        return true;
    });
	$.validator.addMethod("manual_valid", function( value, element ) {       
						 return true;
						});
$.validator.addMethod("manual_invalid", function( value, element ) {       
						 return false;
						});

							


function hasWhiteSpace(s) {

  return /\s/g.test(s);
}

$.validator.addMethod("notNumber", function(value, element, param) {
	   var reg = /[0-9]/;
	   var regex = new RegExp("^[0-9()@,-./_]*$");
	   var regex1 = new RegExp("^[()@,-./_0-9()@,-./_ ']+( [()@,-./_0-9()@,-./_ ']+)*$");
		//var regex2 = new RegExp("^[0-9@,./_]+( [0-9']+)*$");

			
		
	  /* if((!isNaN(value) || value.indexOf(' ') >= 0 || regex.test(value)) && value!="" ){
			 return false;
	   }else{
			   return true;
	   }
	 */
	 //if((!isNaN(value) || regex.test(value) || regex1.test(value) || value.indexOf('\\') >= 0) && value!="" )--for not allowing \
		if((!isNaN(value) || regex.test(value) || regex1.test(value) ) && value!="" ){
			 return false;
	   }else{
			   return true;
	   }	

	  

});



 $.validator.addMethod("Number", function(value, element, param) {
                       var reg =  /^[0-9]+$/;					
                       if (reg.test(value)) {
								return true;
						}
						else
						{
							 return false;
						}

                });

	$.validator.addMethod("onlyzeronotallowed", function(value, element, param) {                     	
		if( value!='')
				{
	
                       if (parseInt(value)>0) {
								return true;
						}
						else
						{
							 return false;
						}
				}
				else
				{
					 return true;
				}

                });






$.validator.addMethod("noNumberAtAll", function(value, element, param) {
                       var reg = /[0-9]/;					
                       if (reg.test(value)) {
								return false;
						}
						else
						{
							 return true;
						}

                });




$.validator.addMethod("validstring", function(value, element, param) {
                       var reg = /(.)\1{2,}/;					
                       if (reg.test(value)) {
								return false;
						}
						else
						{
							 return true;
						}

                });







$.validator.addMethod("date", function(date, element) {
 //              
   /*var regDate = /^(((0[1-9]|[12]\d|3[01])\-(0[13578]|1[02])\-((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\-(0[13456789]|1[012])\-((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\-02\-((19|[2-9]\d)\d{2}))|(29\-02\-((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/;
   if (optional(element) || date.match(regDate))
	{
		return true;
	}
	return false;*/
  return this.optional(element) || date.match(/^(((0[1-9]|[12]\d|3[01])\-(0[13578]|1[02])\-((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\-(0[13456789]|1[012])\-((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\-02\-((19|[2-9]\d)\d{2}))|(29\-02\-((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/);
  });




$.validator.addMethod("float1", function(value, element) {

                       var reg = /^[-+]?\d{0,12}(\.\d{1})?\d{0,2}$/;
                       if (reg.test(value)) {
								return true;
						}
						else
						{
							 return false;
						}

                });


function captchaAlert(msg,captcha)
{  //alert("err="+msg);
	
	$('#errorIcon1').removeClass('d-none');
	$("#error_message").show().html(msg);
	$("#captcha_modal_div").show().html(captcha);

var myModal = new bootstrap.Modal($('#captcha_modal'), {
   backdrop: "static", //remove ability to close modal with click
      keyboard: false, //remove option to close with keyboard
      show: true //Display loader!
})
	myModal.toggle();

	
}

function errorAlert(msg)
{  //alert("err="+msg);
	$('#successIcon').addClass('d-none');
	$('#errorIcon').removeClass('d-none');
	$(".alert-danger-cust").show().html(msg);
	$(".alert-success-cust").hide().html('');
//	$('#validateError').modal('show'); 

var myModal = new bootstrap.Modal($('#validateError'), {
   backdrop: "static", //remove ability to close modal with click
      keyboard: false, //remove option to close with keyboard
      show: true //Display loader!
})
	myModal.toggle();

	/*$("#validateError").modal({
	 backdrop: "static", //remove ability to close modal with click
	 keyboard: false, //remove option to close with keyboard
	  show: true //Display loader!
	});*/
}
function successAlert(msg)
{
	$('#errorIcon').addClass('d-none');
	$('#successIcon').removeClass('d-none');
	$(".alert-success-cust").show().html(msg);
	$(".alert-danger-cust").hide().html('');

	var myModal = new bootstrap.Modal($('#validateError'), {
   backdrop: "static", //remove ability to close modal with click
      keyboard: false, //remove option to close with keyboard
      show: true //Display loader!
})
	myModal.toggle();


	/*$("#validateError").modal({
	  backdrop: "static", //remove ability to close modal with click
	  keyboard: false, //remove option to close with keyboard
	  show: true //Display loader!
	});*/
}

function pattern()
{
	

	$.validator.addMethod("alphanum", function(value, element) {
  	return this.optional(element)|| /^\w+$/i.test(value);
	});


	$.validator.addMethod("EngNotAllowed", function( value, element ) {
	        var regex = new RegExp("^[^a-zA-Z]*$");
	        var key = value;
	        
	        if (regex.test(key)) {
	           return true;
	        }
	        return false;
	    });

	$.validator.addMethod('time', function(value, element, param) {
	    return value == '' || value.match(/^([01][0-9]|2[0-3]):[0-5][0-9]$/) || value.match(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/);
	}, 'Enter a valid time: hh:mm');

	$.validator.addMethod("EngAndSpecialCharNotAllowed", function( value, element ) {
        var regex = new RegExp("^[^a-zA-Z<>\";`%!~#$|+%&*=\[\\]\:^{}?]*$");
        var key = value;
        
        if (regex.test(key)) {
           return true;
        }
        return false;
    });
    $.validator.addMethod("OnlySpecialCharsNotAllowed", function( value, element ) {
        
        // var regex = new RegExp("^[0-9@,-./_]*$");
        var regex = new RegExp("^[^0-9][()@,./\-_:]*$");
        var key = value;
        
        if (regex.test(key)) {
           return false;
        }
        else
        {
        return true;
        }
    });
    $.validator.addMethod("CharCheckForSection", function( value, element ) {
        
         var regexalpha = new RegExp("^[a-zA-Z0-9,()]+$");
        var keyalpha = value;

        if (regexalpha.test(keyalpha) || keyalpha=='') {
           return true;
        }
        return false;
    });


	$.validator.addMethod("specialChars", function( value, element ) {
        var regex = new RegExp("^[^<>\";`%!~#$|+%&*=\[\\]\:^{}?]*$");
        var key = value;
        
        if (regex.test(key)) {
           return true;
        }
        return false;
    });

    $.validator.addMethod("nospecialChars", function( value, element ) {
        //var regex = new RegExp("^[^<>'\"/;`%!~#$%&*()=\[\\]\:{}?@.,_-]*$");
        var regex = new RegExp("^[a-zA-Z]+$");
        var key = value;

        if (regex.test(key)) {
           return true;
        }
        return false;
    });
    $.validator.addMethod("urlspecialChars", function( value, element ) {
        var regex = new RegExp("^[^<>'\";`%!~#$%&*()=\[\\]\^{}?@,]*$");
        var key = value;
        
        if (regex.test(key)) {
           return true;
        }
        return false;
    });

    $.validator.addMethod("alphabet", function( value, element ) {
        var regexalpha = new RegExp("^[a-zA-Z,. ]+$");
        var keyalpha = value;

        if (regexalpha.test(keyalpha) || keyalpha=='') {
           return true;
        }
        return false;
    });
    $.validator.addMethod("password", function( value, element ) {
       	//return /^[A-Za-z0-9\d@#$%&*]*$/.test(value) && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[@#$%&*]/.test(value) && /\d/.test(value);
		return /^[A-Za-z0-9\d@#$%&*]*$/.test(value) && /[a-z]/.test(value) && /[@#$%&*]/.test(value) && /\d/.test(value);
    });
    

    $.validator.addMethod("emailchar", function( value, element ) {
        var regexalpha = new RegExp("^[a-zA-Z0-9@._-]+$");
        var keyalpha = value;

        if (regexalpha.test(keyalpha) || keyalpha=='') {
           return true;
        }
        return false;
    });

    $.validator.addMethod("alphabetnumber", function( value, element ) {
        var regexalpha = new RegExp("^[a-zA-Z0-9, ]+$");
        var keyalpha = value;

        if (regexalpha.test(keyalpha) || keyalpha=='') {
           return true;
        }
        return false;
    });

    $.validator.addMethod("noalphabet", function( value, element ) {
        var regexalpha = new RegExp("^[a-zA-Z]+$");
        var keyalpha = value;

        if (regexalpha.test(keyalpha) && keyalpha!='') {
           return false;
        }
        return true;
    });
    $.validator.addMethod("manual_valid", function( value, element ) {       
	                         return true;
	                        });
	$.validator.addMethod("manual_invalid", function( value, element ) {       
	                         return false;
	                        });
	$.validator.addMethod("notNumber", function(value, element, param) {
           var reg = /[0-9]/;
           var regex = new RegExp("^[0-9()@,-./_]*$");
           var regex1 = new RegExp("^[()@,-./_0-9()@,-./_ ']+( [()@,-./_0-9()@,-./_ ']+)*$");
            //var regex2 = new RegExp("^[0-9@,./_]+( [0-9']+)*$");

                
            
          /* if((!isNaN(value) || value.indexOf(' ') >= 0 || regex.test(value)) && value!="" ){
                 return false;
           }else{
                   return true;
           }
         */
         //if((!isNaN(value) || regex.test(value) || regex1.test(value) || value.indexOf('\\') >= 0) && value!="" )--for not allowing \
            if((!isNaN(value) || regex.test(value) || regex1.test(value) ) && value!="" ){
                 return false;
           }else{
                   return true;
           }    

          

    });



	 $.validator.addMethod("Number", function(value, element, param) {
           var reg =  /^[0-9]+$/;                   
           if (reg.test(value) || value=='') {
                    return true;
            }
            else
            {
                 return false;
            }

    });

	$.validator.addMethod("onlyzeronotallowed", function(value, element, param) {                      
		if( value!='')
	    {

	           if (parseInt(value)>0) {
	                    return true;
	            }
	            else
	            {
	                 return false;
	            }
	    }
	    else
	    {
	         return true;
	    }

    });






	$.validator.addMethod("noNumberAtAll", function(value, element, param) {
           var reg = /[0-9]/;                   
           if (reg.test(value)) {
                    return false;
            }
            else
            {
                 return true;
            }

    });




	$.validator.addMethod("validstring", function(value, element, param) {
       var reg = /(.)\1{2,}/;                   
       if (reg.test(value)) {
                return false;
        }
        else
        {
             return true;
        }

    });


	$.validator.addMethod("date", function(date, element) {
	 //              
	   /*var regDate = /^(((0[1-9]|[12]\d|3[01])\-(0[13578]|1[02])\-((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\-(0[13456789]|1[012])\-((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\-02\-((19|[2-9]\d)\d{2}))|(29\-02\-((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/;
	   if (optional(element) || date.match(regDate))
	    {
	        return true;
	    }
	    return false;*/
	  return this.optional(element) || date.match(/^(((0[1-9]|[12]\d|3[01])\-(0[13578]|1[02])\-((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\-(0[13456789]|1[012])\-((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\-02\-((19|[2-9]\d)\d{2}))|(29\-02\-((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/);
	  });




	$.validator.addMethod("float1", function(value, element) {

       var reg = /^[-+]?\d{0,12}(\.\d{1})?\d{0,2}$/;
       if (reg.test(value)) {
                return true;
        }
        else
        {
             return false;
        }

    });


}

function ajaxCallreadPDF(jsonobj)
{
	
	$(".alert-danger").hide();$("#msg-danger").html('');
	$(".alert-success").hide();$("#msg-success").html('');
	var base_url=$('#base_url').val();
	var token=$('#app_token').val();
	var url=jsonobj.url;
	var postdata=jsonobj.postdata;
	
	var callback=jsonobj.callback;
	var connection=jsonobj.connection;
	var result= [];
	if(jsonobj.chosen==false)
		objchosen={chosen:false};
	else if(jsonobj.chosen==true)
		objchosen={chosen:true};
	else if(typeof jsonobj['chosen'] == 'undefined')
		objchosen={chosen:false};
	if(typeof jsonobj['dataType'] == 'undefined')
		jsondataType='json';
	else
		jsondataType=jsonobj.dataType;

	if(typeof jsonobj['loader'] == 'undefined')
		objloader={loader:true};
	else
		objloader=jsonobj.loader;
	if(objloader)
		fadein();
	var chosen=objchosen.chosen;
	var estCode = $("#selEstablishment").val();
	if(estCode!='' && estCode!=undefined)
	{
		var myarr = estCode.split("~");
		var stateCode = myarr[0];
		var distCode = myarr[1];
		var estCode = myarr[2];
	}
	
	$.ajax({
		type: "POST",
		url:  base_url+'/?p='+url,
		dataType: jsondataType,
		async: false,
		data:postdata+'&ajax_req='+true+'&app_token='+token,
		//contentType : 'application/pdf',
		error: function(jqXHR, textStatus, errorThrown) {
			
			var responseArray=jqXHR.responseText.split('#####');
			if(responseArray[0]!='' && responseArray[0]!=undefined && responseArray[0]!=null)
				errorAlert(responseArray[0]);
			setTimeout(function(){fadeout()},300);
			setTimeout(function(){fadeout()},1000);
			$('#submitdata').attr('disabled',false);

			if(responseArray[1]!='' && responseArray[1]!=undefined)
				$('#app_token').val(responseArray[1]);
			else
				$('#app_token').val(token);
			result['status']=false;
			callback(result);
		},
		beforeSend:function()
	   	{	//alert('fadein')
				//if(chosen && url != restricted_url && url != restricted_url1)
	   			
	   	},
		success:function( result ) {
			setTimeout(function(){fadeout()},300);
			setTimeout(function(){fadeout()},1000);
			if(result.errormsg!='' && result.errormsg!=undefined && result.errormsg!=null)
			{
				errorAlert(result.errormsg);
				result['status']=false;
				callback(result);
			}
			if(result.msg!='' && result.msg!=undefined && result.msg!=null)
			{
				successAlert(result.msg);
			}
			result['status']=true;
			callback(result);
			$('#app_token').val(result.app_token);
		}
	
	});
}

function validateCaptcha(str)
{
	
	var search_text=$("#search_text").val();
	if(search_text=='' && str!='Y' && str!='Z')
	{
		errorAlert('Please enter "keyword" in the text box or click on "Advanced Search"');
		return false;
	}
	var captcha=$("#captcha").val();
	if(captcha=='')
	{
		errorAlert('Please enter captcha');
		return false;
	}
	var escr_flag=$("#escr_flag").val();
	var court_type=$("#fcourt_type").val();//alert(court_type)
	if(escr_flag=='Y')
	{
		court_type=3;
		
	}
	if(court_type==3)
		{
		 $("#escr_details").show();
		 $("#disp_year").html('Citation Year');
		$("#court_details").hide();
		//$("#div_court_dtls").hide();
		 $("#li_court").html('Bench');
	}
	else
	{
		$("#escr_details").hide();
		$("#disp_year").html('Disposal Year');
		$("#court_details").show();
		$("#div_court_dtls").show();
		 $("#li_court").html('Court');
		$("#sel_lang").val('');
		$("#sel_lang").hide();
	}	
//	var search_opt=$("[name='searchOptions']").val();
	 var search_opt=$("input[type='radio'][name='searchOptions']:checked").val();
	var proximity=$("#sel_prox").val();
	var sel_lang=$("#sel_lang").val();
	//var court_type=$("#fcourt_type").val();
	//var text=$("#search_text").val();
	var post_data='captcha='+captcha+'&search_text='+search_text+'&search_opt='+search_opt+'&escr_flag='+escr_flag+'&proximity='+proximity+'&sel_lang='+sel_lang;
	var url='pdf_search/checkCaptcha';
	//alert(post_data)
	ajaxCall({url:url,postdata:post_data,callback:callbk});
               
	function callbk(result)
	{
		
		if(result.captcha_status=='N')
		{
			$("#captcha").val('');
			captcha_image_audioObj.refresh();
			document.getElementById('captcha_image').src = 'vendor/securimage/securimage_show.php? ' + Math.random(); this.blur();
			return false;
		}
		else if(result.captcha_status=='Y')
		{
			if(str=='Z')
			{
				$('#validateError').modal('hide');
				$('#captcha_modal').modal('hide');
				$('.modal-backdrop').remove();
				setTimeout(function(){get_details_searchclick('','','','')},30);
			}
			else
			{
				if(court_type==3)
					window.location.replace('https://scr.sci.gov.in/scrsearch');
				else
					requestUri('pdf_search/home?text='+search_text+'&captcha='+captcha+'&search_opt='+search_opt+'&fcourt_type='+court_type+'&escr_flag='+escr_flag+'&proximity='+proximity+'&sel_lang='+sel_lang);
				  if(court_type==3)
                {
              $("#sel_lang").show();
        }
        else
        {
    
               // $("#sel_lang").val('');
                $("#sel_lang").hide();
        }

			}
		}
		//$('#search_text').val(search_text);

	}
}
